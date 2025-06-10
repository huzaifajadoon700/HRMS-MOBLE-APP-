const socketIO = require('socket.io');
const Order = require('./Models/Order');

let io;

// Store active order progressions
const activeOrderProgression = new Map();

// Function to update order status in the database and emit update to clients
const updateOrderStatus = async (orderId, status) => {
    if (!orderId || !status) {
        console.error(`Invalid orderId or status: ${orderId}, ${status}`);
        return null;
    }
    
    const currentTime = new Date();
    const statusUpdate = {
        orderId,
        status,
        timestamp: currentTime,
        completed: status.toLowerCase() === 'delivered'
    };
    
    console.log(`[${currentTime.toLocaleTimeString()}] Order ${orderId} status updated to: ${status}`);
    
    // Update in database (simplified)
    try {
        let dbStatus = status.toLowerCase();
        if (status === 'Order Received') dbStatus = 'pending';
        if (status === 'Ready for Pickup') dbStatus = 'ready_for_pickup';
        if (status === 'On the Way') dbStatus = 'out_for_delivery';
        if (status === 'Arriving Soon') dbStatus = 'arriving_soon';
        
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: dbStatus },
            { new: true }
        );
        
        if (updatedOrder) {
            console.log(`[DB] Order ${orderId} updated to ${status} status in database`);
        }
    } catch (error) {
        console.error(`[DB] Error updating order ${orderId}:`, error);
    }
    
    // Broadcast update to all clients
    if (io) {
        io.emit('orderUpdate', statusUpdate);
    }
    
    return statusUpdate;
};

// Initialize socket.io server
const init = (server) => {
    io = socketIO(server, {
        cors: {
            origin: ["*"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // Handle order tracking request
        socket.on('trackOrder', async ({ orderId }) => {
            if (!orderId) {
                socket.emit('error', { message: 'Invalid order ID' });
                return;
            }
            
            console.log(`[Socket] Client ${socket.id} tracking order: ${orderId}`);
            
            // If this order is already being tracked, just have this socket join the room
            if (activeOrderProgression.has(orderId)) {
                console.log(`[Socket] Order ${orderId} already being tracked, joining room`);
                socket.join(`order_${orderId}`);
                
                // Send the current status to just this client
                try {
                    const order = await Order.findById(orderId);
                    if (order) {
                        const status = order.status === 'delivered' ? 'Delivered' : 
                                      (order.status === 'pending' ? 'Order Received' : 
                                      order.status.charAt(0).toUpperCase() + order.status.slice(1));
                        
                        socket.emit('orderUpdate', {
                            orderId,
                            status,
                            timestamp: new Date(),
                            completed: order.status === 'delivered'
                        });
                    }
                } catch (err) {
                    console.error(`[Socket] Error fetching order status:`, err);
                }
                
                return;
            }
            
            // Mark order as being tracked
            activeOrderProgression.set(orderId, true);
            
            // Join room for this order
            socket.join(`order_${orderId}`);
            
            // Define status progression with delays
            const statusProgression = [
                { status: 'Order Received', delay: 0 },
                { status: 'Preparing', delay: 6000 },
                { status: 'Ready for Pickup', delay: 12000 },
                { status: 'On the Way', delay: 18000 },
                { status: 'Arriving Soon', delay: 24000 },
                { status: 'Delivered', delay: 30000 }
            ];
            
            // Start progression with initial status
            updateOrderStatus(orderId, statusProgression[0].status);
            
            // Schedule remaining status updates
            let timeouts = [];
            
            statusProgression.slice(1).forEach(({ status, delay }) => {
                const timeout = setTimeout(() => {
                    updateOrderStatus(orderId, status);
                    
                    
                    // If this is the final status, mark order as no longer being tracked
                    if (status === 'Delivered') {
                        activeOrderProgression.delete(orderId);
                        timeouts.forEach(t => clearTimeout(t));
                        timeouts = [];
                    }
                }, delay);
                
                timeouts.push(timeout);
            });
            
            // Clean up if socket disconnects
            socket.on('disconnect', () => {
                // Only clean up if this was the last socket tracking this order
                const room = io.sockets.adapter.rooms.get(`order_${orderId}`);
                if (!room || room.size === 0) {
                    console.log(`[Socket] No more clients tracking order ${orderId}, cleaning up`);
                    activeOrderProgression.delete(orderId);
                    timeouts.forEach(t => clearTimeout(t));
                }
            });
        });

        // Simple ping/pong for connection verification
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    init,
    getIO,
    updateOrderStatus
};
