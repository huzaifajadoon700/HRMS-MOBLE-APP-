import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';

import '../../../data/models/table_model.dart';
import '../../../services/reservation_service.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/loading_widget.dart';
import 'reservation_confirmation_screen.dart';
import '../payment/payment_screen.dart';

class TableReservationScreen extends StatefulWidget {
  final TableModel table;

  const TableReservationScreen({
    super.key,
    required this.table,
  });

  @override
  State<TableReservationScreen> createState() => _TableReservationScreenState();
}

class _TableReservationScreenState extends State<TableReservationScreen> {
  final ReservationService _reservationService = ReservationService();
  final _formKey = GlobalKey<FormState>();

  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _selectedTimeSlot = '19:00';
  int _partySize = 2;
  final TextEditingController _specialRequestsController =
      TextEditingController();
  final TextEditingController _occasionController = TextEditingController();

  bool _isLoading = false;
  bool _isCheckingAvailability = false;
  bool _isAvailable = true;
  String? _availabilityMessage;

  final List<String> _timeSlots = [
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00'
  ];

  final List<String> _occasions = [
    'Birthday',
    'Anniversary',
    'Date Night',
    'Business Meeting',
    'Family Gathering',
    'Celebration',
    'Other'
  ];

  // Reservation fee - $10 per person
  double get _reservationFee => _partySize * 10.0;

  @override
  void initState() {
    super.initState();
    _reservationService.initialize();
    _checkAvailability();
  }

  @override
  void dispose() {
    _specialRequestsController.dispose();
    _occasionController.dispose();
    super.dispose();
  }

  Future<void> _checkAvailability() async {
    setState(() {
      _isCheckingAvailability = true;
    });

    try {
      final result = await _reservationService.checkTableAvailability(
        tableId: widget.table.id,
        reservationDate: _selectedDate,
        timeSlot: _selectedTimeSlot,
      );

      setState(() {
        _isAvailable = result['available'];
        _availabilityMessage = result['message'];
        _isCheckingAvailability = false;
      });
    } catch (e) {
      setState(() {
        _isAvailable = false;
        _availabilityMessage = 'Error checking availability';
        _isCheckingAvailability = false;
      });
    }
  }

  Future<void> _makeReservation() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_isAvailable) return;

    // Navigate to payment screen first
    final paymentResult = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) => PaymentScreen(
          amount: _reservationFee,
          description: 'Table Reservation - Table ${widget.table.tableNumber}',
          type: 'reservation',
          itemId: widget.table.id,
        ),
      ),
    );

    if (paymentResult != true) {
      // Payment was cancelled or failed
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Get user details from auth provider (before async operations)
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;

      final result = await _reservationService.createReservation(
        tableId: widget.table.id,
        reservationDate: _selectedDate,
        timeSlot: _selectedTimeSlot,
        partySize: _partySize,
        specialRequests: _specialRequestsController.text.trim().isEmpty
            ? null
            : _specialRequestsController.text.trim(),
        occasion: _occasionController.text.trim().isEmpty
            ? null
            : _occasionController.text.trim(),
        tableNumber: widget.table.tableNumber,
        fullName: user?.name ?? '',
        email: user?.email ?? '',
        phone: user?.phoneNumber ?? '',
        paymentMethod: 'card',
      );

      if (!mounted) return;

      if (result['success']) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder: (_) => ReservationConfirmationScreen(
                reservation: result['reservation']),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Reservation failed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);

    if (!authProvider.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Reserve Table'),
        ),
        body: const Center(
          child: Text('Please login to make a reservation'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reserve Table'),
        elevation: 0,
      ),
      body: _isLoading
          ? const LoadingWidget(message: 'Making your reservation...')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Table Info Card
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                widget.table.imageUrl ?? '',
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Container(
                                    width: 80,
                                    height: 80,
                                    color: theme.colorScheme.surface,
                                    child: const Icon(Icons.table_bar),
                                  );
                                },
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Table ${widget.table.tableNumber}',
                                    style:
                                        theme.textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Capacity: ${widget.table.capacity} people',
                                    style: theme.textTheme.bodyMedium,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Location: ${widget.table.location}',
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: theme.colorScheme.onSurface
                                          .withValues(alpha: 0.7),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Date Selection
                    Text(
                      'Select Date',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: TableCalendar<DateTime>(
                          firstDay: DateTime.now(),
                          lastDay: DateTime.now().add(const Duration(days: 90)),
                          focusedDay: _selectedDate,
                          selectedDayPredicate: (day) =>
                              isSameDay(_selectedDate, day),
                          onDaySelected: (selectedDay, focusedDay) {
                            setState(() {
                              _selectedDate = selectedDay;
                            });
                            _checkAvailability();
                          },
                          calendarFormat: CalendarFormat.month,
                          startingDayOfWeek: StartingDayOfWeek.monday,
                          headerStyle: const HeaderStyle(
                            formatButtonVisible: false,
                            titleCentered: true,
                          ),
                          calendarStyle: CalendarStyle(
                            outsideDaysVisible: false,
                            selectedDecoration: BoxDecoration(
                              color: theme.colorScheme.primary,
                              shape: BoxShape.circle,
                            ),
                            todayDecoration: BoxDecoration(
                              color: theme.colorScheme.primary
                                  .withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Time Selection
                    Text(
                      'Select Time',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _timeSlots.map((time) {
                        final isSelected = _selectedTimeSlot == time;
                        return FilterChip(
                          label: Text(time),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              _selectedTimeSlot = time;
                            });
                            _checkAvailability();
                          },
                          selectedColor:
                              theme.colorScheme.primary.withValues(alpha: 0.2),
                          checkmarkColor: theme.colorScheme.primary,
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),

                    // Party Size
                    Text(
                      'Party Size',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        IconButton(
                          onPressed: _partySize > 1
                              ? () {
                                  setState(() {
                                    _partySize--;
                                  });
                                }
                              : null,
                          icon: const Icon(Icons.remove),
                          style: IconButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary
                                .withValues(alpha: 0.1),
                            foregroundColor: theme.colorScheme.primary,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Text(
                          '$_partySize people',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 16),
                        IconButton(
                          onPressed: _partySize < widget.table.capacity
                              ? () {
                                  setState(() {
                                    _partySize++;
                                  });
                                }
                              : null,
                          icon: const Icon(Icons.add),
                          style: IconButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary
                                .withValues(alpha: 0.1),
                            foregroundColor: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Occasion
                    Text(
                      'Occasion (Optional)',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _occasionController.text.isEmpty
                          ? null
                          : _occasionController.text,
                      decoration: const InputDecoration(
                        hintText: 'Select an occasion',
                        border: OutlineInputBorder(),
                      ),
                      items: _occasions.map((occasion) {
                        return DropdownMenuItem(
                          value: occasion,
                          child: Text(occasion),
                        );
                      }).toList(),
                      onChanged: (value) {
                        _occasionController.text = value ?? '';
                      },
                    ),

                    const SizedBox(height: 16),

                    // Special Requests
                    Text(
                      'Special Requests (Optional)',
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _specialRequestsController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        hintText: 'Any special requests or preferences...',
                        border: OutlineInputBorder(),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Availability Status
                    if (_isCheckingAvailability)
                      const Center(child: CircularProgressIndicator())
                    else
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _isAvailable
                              ? Colors.green.withValues(alpha: 0.1)
                              : Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _isAvailable ? Colors.green : Colors.red,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isAvailable ? Icons.check_circle : Icons.error,
                              color: _isAvailable ? Colors.green : Colors.red,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _availabilityMessage ??
                                    (_isAvailable
                                        ? 'Table is available'
                                        : 'Table is not available'),
                                style: TextStyle(
                                  color:
                                      _isAvailable ? Colors.green : Colors.red,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    const SizedBox(height: 24),

                    // Reservation Fee
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Reservation Fee',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Fee per person:',
                                  style: theme.textTheme.bodyMedium,
                                ),
                                Text(
                                  '\$10.00',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Party size:',
                                  style: theme.textTheme.bodyMedium,
                                ),
                                Text(
                                  '$_partySize people',
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Total Fee:',
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  '\$${_reservationFee.toStringAsFixed(2)}',
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: theme.colorScheme.primary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Reserve Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isAvailable && !_isCheckingAvailability
                            ? _makeReservation
                            : null,
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: Text(
                          _isAvailable ? 'Reserve Table' : 'Not Available',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
