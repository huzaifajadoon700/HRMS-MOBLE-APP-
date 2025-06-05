import 'dart:convert';
import 'package:dio/dio.dart';
import '../core/constants/app_constants.dart';
import '../data/models/reservation_model.dart';
import '../data/models/table_model.dart';
import 'auth_service.dart';

class ReservationService {
  static final ReservationService _instance = ReservationService._internal();
  factory ReservationService() => _instance;
  ReservationService._internal();

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

  Future<Map<String, dynamic>> createReservation({
    required String tableId,
    required DateTime reservationDate,
    required String timeSlot,
    required int partySize,
    String? specialRequests,
    String? occasion,
    String? tableNumber,
    String? fullName,
    String? email,
    String? phone,
    String paymentMethod = 'card',
    String? paymentMethodId,
  }) async {
    try {
      // Calculate end time (2 hours after start time by default)
      final startTime = timeSlot;
      final startHour = int.parse(startTime.split(':')[0]);
      final startMinute = int.parse(startTime.split(':')[1]);
      final endHour = (startHour + 2) % 24;
      final endTime =
          '${endHour.toString().padLeft(2, '0')}:${startMinute.toString().padLeft(2, '0')}';

      // Calculate total price (assuming $10 per person)
      final totalPrice = partySize * 10.0;

      final reservationData = {
        'tableId': tableId,
        'tableNumber': tableNumber ?? 'T1',
        'reservationDate':
            reservationDate.toIso8601String().split('T')[0], // Date only
        'time': timeSlot,
        'endTime': endTime,
        'guests': partySize,
        'payment': paymentMethod,
        'totalPrice': totalPrice,
        'phone': phone ?? '',
        'fullName': fullName ?? '',
        'email': email ?? '',
        'specialRequests': specialRequests ?? '',
        if (paymentMethodId != null) 'paymentMethodId': paymentMethodId,
      };

      print('Creating reservation with data: $reservationData');

      final response =
          await _dio!.post('/api/reservations', data: reservationData);

      if (response.statusCode == 201) {
        final data = response.data;
        return {
          'success': true,
          'reservation': data['reservation'] ?? data,
          'message': data['message'] ?? 'Reservation created successfully',
        };
      }

      return {
        'success': false,
        'message': response.data['message'] ?? 'Reservation failed',
      };
    } on DioException catch (e) {
      print('Reservation creation error: ${e.response?.data}');
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Network error occurred',
      };
    } catch (e) {
      print('Unexpected reservation creation error: $e');
      return {
        'success': false,
        'message': 'An unexpected error occurred',
      };
    }
  }

  Future<List<ReservationModel>> getUserReservations() async {
    try {
      print('Fetching user reservations...');
      final response = await _dio!.get('/api/reservations/user');

      print('Reservations response status: ${response.statusCode}');
      print('Reservations response data: ${response.data}');

      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> reservationsData;

        if (data is List) {
          reservationsData = data;
        } else if (data is Map && data['reservations'] != null) {
          reservationsData = data['reservations'];
        } else {
          reservationsData = [];
        }

        print('Found ${reservationsData.length} reservations');
        return reservationsData
            .map((item) => _mapApiToReservationModel(item))
            .toList();
      }

      return [];
    } on DioException catch (e) {
      print('Error fetching reservations: ${e.response?.data}');
      throw Exception(
          e.response?.data['message'] ?? 'Failed to load reservations');
    } catch (e) {
      print('Unexpected error fetching reservations: $e');
      throw Exception('An unexpected error occurred');
    }
  }

  Future<List<ReservationModel>> getAllReservations() async {
    try {
      final response = await _dio!.get('/api/reservations');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['reservations'];
        return data.map((item) => _mapApiToReservationModel(item)).toList();
      }

      return [];
    } on DioException catch (e) {
      throw Exception(
          e.response?.data['message'] ?? 'Failed to load reservations');
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<ReservationModel?> getReservationById(String reservationId) async {
    try {
      final response = await _dio!.get('/api/reservations/$reservationId');

      if (response.statusCode == 200) {
        return _mapApiToReservationModel(response.data['reservation']);
      }

      return null;
    } on DioException catch (e) {
      throw Exception(
          e.response?.data['message'] ?? 'Failed to load reservation');
    } catch (e) {
      throw Exception('An unexpected error occurred');
    }
  }

  Future<Map<String, dynamic>> updateReservation(
      String reservationId, Map<String, dynamic> updates) async {
    try {
      final response =
          await _dio!.put('/api/reservations/$reservationId', data: updates);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'reservation':
              _mapApiToReservationModel(response.data['reservation']),
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

  Future<Map<String, dynamic>> cancelReservation(String reservationId) async {
    try {
      final response = await _dio!.delete('/api/reservations/$reservationId');

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

  Future<Map<String, dynamic>> checkTableAvailability({
    required String tableId,
    required DateTime reservationDate,
    required String timeSlot,
  }) async {
    try {
      final response =
          await _dio!.get('/api/tables/availability', queryParameters: {
        'tableId': tableId,
        'reservationDate': reservationDate.toIso8601String(),
        'timeSlot': timeSlot,
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

  ReservationModel _mapApiToReservationModel(Map<String, dynamic> apiData) {
    return ReservationModel(
      id: apiData['_id'],
      userId: apiData['userId'],
      tableId: apiData['tableId'],
      reservationDate: DateTime.parse(apiData['reservationDate']),
      timeSlot: apiData['timeSlot'],
      partySize: apiData['partySize'],
      status: apiData['status'] ?? 'pending',
      specialRequests: apiData['specialRequests'],
      occasion: apiData['occasion'],
      createdAt: DateTime.parse(apiData['createdAt']),
      updatedAt: DateTime.parse(apiData['updatedAt']),
      table: apiData['table'] != null
          ? _mapApiToTableModel(apiData['table'])
          : null,
    );
  }

  TableModel _mapApiToTableModel(Map<String, dynamic> apiData) {
    return TableModel(
      id: apiData['_id'] ?? apiData['id'],
      tableNumber: apiData['tableNumber'],
      capacity: apiData['capacity'],
      location: apiData['location'] ?? 'Main Dining',
      status: apiData['status'] ?? 'available',
      isReserved: apiData['isReserved'] ?? false,
      reservedBy: apiData['reservedBy'],
      reservationTime: apiData['reservationTime'] != null
          ? DateTime.parse(apiData['reservationTime'])
          : null,
      imageUrl: apiData['image'] ?? apiData['imageUrl'],
    );
  }
}

class ReservationModel {
  final String id;
  final String userId;
  final String tableId;
  final DateTime reservationDate;
  final String timeSlot;
  final int partySize;
  final String status;
  final String? specialRequests;
  final String? occasion;
  final DateTime createdAt;
  final DateTime updatedAt;
  final TableModel? table;

  ReservationModel({
    required this.id,
    required this.userId,
    required this.tableId,
    required this.reservationDate,
    required this.timeSlot,
    required this.partySize,
    required this.status,
    this.specialRequests,
    this.occasion,
    required this.createdAt,
    required this.updatedAt,
    this.table,
  });

  bool get isActive => status == 'confirmed' || status == 'seated';
  bool get isPending => status == 'pending';
  bool get isCancelled => status == 'cancelled';
  bool get isCompleted => status == 'completed';

  String get statusDisplayText {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending Confirmation';
      case 'confirmed':
        return 'Confirmed';
      case 'seated':
        return 'Seated';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      default:
        return status;
    }
  }

  static List<ReservationModel> dummyReservations() {
    return [
      ReservationModel(
        id: '1',
        userId: 'user1',
        tableId: 'table1',
        reservationDate: DateTime.now().add(const Duration(days: 1)),
        timeSlot: '19:00',
        partySize: 4,
        status: 'confirmed',
        specialRequests: 'Window seat preferred',
        occasion: 'Anniversary',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now().subtract(const Duration(hours: 2)),
        table: TableModel.dummyTables().first,
      ),
    ];
  }
}
