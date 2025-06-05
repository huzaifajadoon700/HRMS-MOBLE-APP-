import 'dart:convert';
import 'package:dio/dio.dart';
import '../core/constants/app_constants.dart';
import '../data/models/booking_model.dart';
import '../data/models/room_model.dart';
import 'auth_service.dart';

class BookingService {
  static final BookingService _instance = BookingService._internal();
  factory BookingService() => _instance;
  BookingService._internal();

  Dio? _dio;

  void initialize() {
    if (_dio != null) return; // Prevent re-initialization
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Add interceptor for token
    _dio!.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = AuthService().token;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  Future<Map<String, dynamic>> createBooking({
    required String roomId,
    required DateTime checkInDate,
    required DateTime checkOutDate,
    required int guests,
    String? specialRequests,
    String? roomType,
    String? roomNumber,
    String? fullName,
    String? email,
    String? phone,
    String paymentMethod = 'card',
    String? paymentMethodId,
    double? basePrice,
  }) async {
    try {
      // Calculate number of nights
      final nights = checkOutDate.difference(checkInDate).inDays;
      final calculatedBasePrice = basePrice ?? 199.99; // Default room price
      final totalPrice = calculatedBasePrice * nights;
      final taxAmount = totalPrice * 0.1; // 10% tax
      final finalTotal = totalPrice + taxAmount;

      final bookingData = {
        'roomId': roomId,
        'roomType': roomType ?? 'Standard',
        'roomNumber': roomNumber ?? '101',
        'checkInDate': checkInDate.toIso8601String().split('T')[0], // Date only
        'checkOutDate':
            checkOutDate.toIso8601String().split('T')[0], // Date only
        'guests': guests,
        'fullName': fullName ?? '',
        'email': email ?? '',
        'phone': phone ?? '',
        'specialRequests': specialRequests ?? '',
        'payment': paymentMethod,
        'totalPrice': finalTotal,
        'basePrice': calculatedBasePrice,
        'taxAmount': taxAmount,
        'numberOfNights': nights,
        if (paymentMethodId != null) 'paymentMethodId': paymentMethodId,
      };

      print('Creating booking with data: $bookingData');

      final response = await _dio!.post('/api/bookings', data: bookingData);

      if (response.statusCode == 201) {
        final data = response.data;
        return {
          'success': true,
          'booking': data['booking'] ?? data,
          'message': data['message'] ?? 'Booking created successfully',
        };
      }

      return {
        'success': false,
        'message': response.data['message'] ?? 'Booking failed',
      };
    } on DioException catch (e) {
      print('Booking creation error: ${e.response?.data}');
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Network error occurred',
      };
    } catch (e) {
      print('Unexpected booking creation error: $e');
      return {
        'success': false,
        'message': 'An unexpected error occurred',
      };
    }
  }

  Future<List<BookingModel>> getUserBookings() async {
    try {
      print('Fetching user bookings...');
      final response = await _dio!.get('/api/bookings/user');

      print('Bookings response status: ${response.statusCode}');
      print('Bookings response data: ${response.data}');

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> bookingsData;

        if (data is List) {
          bookingsData = data;
        } else if (data is Map && data['bookings'] != null) {
          bookingsData = data['bookings'];
        } else {
          bookingsData = [];
        }

        print('Found ${bookingsData.length} bookings');
        return bookingsData.map((item) => _mapApiToBookingModel(item)).toList();
      }

      return [];
    } on DioException catch (e) {
      print('Error fetching bookings: ${e.response?.data}');
      throw Exception(e.response?.data['message'] ?? 'Failed to load bookings');
    } catch (e) {
      print('Unexpected error fetching bookings: $e');
      throw Exception('An unexpected error occurred');
    }
  }

  Future<List<BookingModel>> getAllBookings() async {
    try {
      final response = await _dio!.get('/api/bookings');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['bookings'];
        return data.map((item) => _mapApiToBookingModel(item)).toList();
      }

      return [];
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to load bookings');
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<BookingModel?> getBookingById(String bookingId) async {
    try {
      final response = await _dio!.get('/api/bookings/$bookingId');

      if (response.statusCode == 200) {
        return _mapApiToBookingModel(response.data['booking']);
      }

      return null;
    } on DioException catch (e) {
      throw Exception(e.response?.data['message'] ?? 'Failed to load booking');
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<Map<String, dynamic>> updateBooking(
      String bookingId, Map<String, dynamic> updates) async {
    try {
      final response =
          await _dio!.put('/api/bookings/$bookingId', data: updates);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'booking': _mapApiToBookingModel(response.data['booking']),
          'message': response.data['message'],
        };
      }

      return {
        'success': false,
        'message': response.data['message'] ?? 'Update failed',
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Network error occurred',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'An unexpected error occurred',
      };
    }
  }

  Future<Map<String, dynamic>> cancelBooking(String bookingId) async {
    try {
      final response = await _dio!.delete('/api/bookings/$bookingId');

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': response.data['message'],
        };
      }

      return {
        'success': false,
        'message': response.data['message'] ?? 'Cancellation failed',
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Network error occurred',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'An unexpected error occurred',
      };
    }
  }

  Future<Map<String, dynamic>> checkRoomAvailability({
    required String roomId,
    required DateTime checkInDate,
    required DateTime checkOutDate,
  }) async {
    try {
      final response =
          await _dio!.get('/api/rooms/availability', queryParameters: {
        'roomId': roomId,
        'checkInDate': checkInDate.toIso8601String(),
        'checkOutDate': checkOutDate.toIso8601String(),
      });

      if (response.statusCode == 200) {
        return {
          'available': response.data['available'],
          'message': response.data['message'],
        };
      }

      return {
        'available': false,
        'message': 'Unable to check availability',
      };
    } on DioException catch (e) {
      return {
        'available': false,
        'message': e.response?.data['message'] ?? 'Network error occurred',
      };
    } catch (e) {
      return {
        'available': false,
        'message': 'An unexpected error occurred',
      };
    }
  }

  BookingModel _mapApiToBookingModel(Map<String, dynamic> apiData) {
    return BookingModel(
      id: apiData['_id'] ?? apiData['id'],
      userId: apiData['userId'],
      roomId: apiData['roomId'],
      roomNumber:
          apiData['roomNumber'] ?? apiData['room']?['roomNumber'] ?? 'N/A',
      roomType: apiData['roomType'] ?? apiData['room']?['type'] ?? 'standard',
      checkInDate: DateTime.parse(apiData['checkInDate']),
      checkOutDate: DateTime.parse(apiData['checkOutDate']),
      numberOfGuests: apiData['guests'] ?? apiData['numberOfGuests'] ?? 1,
      totalAmount: (apiData['totalAmount'] ?? 0).toDouble(),
      status: apiData['status'] ?? 'pending',
      paymentMethod: apiData['paymentMethod'] ?? 'credit_card',
      paymentId: apiData['paymentId'],
      isPaid: apiData['isPaid'] ?? (apiData['paymentStatus'] == 'paid'),
      specialRequests: apiData['specialRequests'],
      bookingDate:
          DateTime.parse(apiData['createdAt'] ?? apiData['bookingDate']),
      cancellationReason: apiData['cancellationReason'],
      cancellationDate: apiData['cancellationDate'] != null
          ? DateTime.parse(apiData['cancellationDate'])
          : null,
      isRefunded: apiData['isRefunded'] ?? false,
      refundAmount: apiData['refundAmount']?.toDouble(),
      guestName: apiData['guestName'] ?? apiData['user']?['name'] ?? 'Guest',
      adults: apiData['adults'] ?? (apiData['guests'] ?? 1),
      children: apiData['children'] ?? 0,
    );
  }

  RoomModel _mapApiToRoomModel(Map<String, dynamic> apiData) {
    return RoomModel(
      id: apiData['_id'] ?? apiData['id'],
      roomNumber: apiData['roomNumber'] ?? 'N/A',
      roomType: apiData['type'] ?? apiData['roomType'] ?? 'standard',
      pricePerNight:
          (apiData['price'] ?? apiData['pricePerNight'] ?? 0).toDouble(),
      capacity: apiData['capacity'] ?? 1,
      amenities: List<String>.from(apiData['amenities'] ?? []),
      imageUrls: apiData['images'] != null
          ? List<String>.from(apiData['images'])
          : [apiData['image'] ?? ''],
      status: apiData['status'] ?? 'available',
      description: apiData['description'],
      floor: apiData['floor'] ?? 1,
      isAvailable: apiData['isAvailable'] ?? true,
      size: apiData['size'] ?? 'Standard',
    );
  }
}
