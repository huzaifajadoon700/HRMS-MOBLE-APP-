import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../services/payment_service.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/loading_widget.dart';

class PaymentScreen extends StatefulWidget {
  final double amount;
  final String description;
  final String type; // 'booking', 'order', 'reservation'
  final String itemId;
  final VoidCallback? onSuccess;
  final VoidCallback? onCancel;

  const PaymentScreen({
    super.key,
    required this.amount,
    required this.description,
    required this.type,
    required this.itemId,
    this.onSuccess,
    this.onCancel,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final PaymentService _paymentService = PaymentService();
  bool _isLoading = false;
  String _selectedPaymentMethod = 'card';

  @override
  void initState() {
    super.initState();
    _paymentService.initialize();
  }

  Future<void> _processPayment() async {
    setState(() {
      _isLoading = true;
    });

    try {
      Map<String, dynamic> result;

      if (_selectedPaymentMethod == 'card') {
        result = await _paymentService.processCardPayment(
          amount: widget.amount,
          currency: 'usd',
          description: widget.description,
          metadata: {
            'type': widget.type,
            'itemId': widget.itemId,
          },
        );
      } else {
        // For cash payments, just mark as pending
        result = {
          'success': true,
          'message': 'Cash payment selected - pay on delivery/arrival',
        };
      }

      if (!mounted) return;

      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Payment successful!'),
            backgroundColor: Colors.green,
          ),
        );

        if (widget.onSuccess != null) {
          widget.onSuccess!();
        } else {
          Navigator.of(context).pop(true);
        }
      } else {
        if (result['cancelled'] == true) {
          // User cancelled payment
          if (widget.onCancel != null) {
            widget.onCancel!();
          } else {
            Navigator.of(context).pop(false);
          }
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'Payment failed'),
              backgroundColor: Colors.red,
            ),
          );
        }
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
          title: const Text('Payment'),
        ),
        body: const Center(
          child: Text('Please login to make a payment'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        elevation: 0,
      ),
      body: _isLoading
          ? const LoadingWidget(message: 'Processing payment...')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Payment Summary Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Payment Summary',
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Description:',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.onSurface
                                      .withValues(alpha: 0.7),
                                ),
                              ),
                              Expanded(
                                child: Text(
                                  widget.description,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.end,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Type:',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.onSurface
                                      .withValues(alpha: 0.7),
                                ),
                              ),
                              Text(
                                widget.type.toUpperCase(),
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Total Amount:',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '\$${widget.amount.toStringAsFixed(2)}',
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

                  // Payment Method Selection
                  Text(
                    'Payment Method',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Credit Card Option
                  Card(
                    child: RadioListTile<String>(
                      title: Row(
                        children: [
                          Icon(
                            Icons.credit_card,
                            color: theme.colorScheme.primary,
                          ),
                          const SizedBox(width: 12),
                          const Text('Credit/Debit Card'),
                        ],
                      ),
                      subtitle: Text(kIsWeb
                          ? 'Simulated payment for web development'
                          : 'Pay securely with Stripe'),
                      value: 'card',
                      groupValue: _selectedPaymentMethod,
                      onChanged: (value) {
                        setState(() {
                          _selectedPaymentMethod = value!;
                        });
                      },
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Cash Option (for applicable types)
                  if (widget.type == 'order' || widget.type == 'reservation')
                    Card(
                      child: RadioListTile<String>(
                        title: Row(
                          children: [
                            Icon(
                              Icons.money,
                              color: theme.colorScheme.primary,
                            ),
                            const SizedBox(width: 12),
                            Text(widget.type == 'order'
                                ? 'Cash on Delivery'
                                : 'Pay at Restaurant'),
                          ],
                        ),
                        subtitle: Text(widget.type == 'order'
                            ? 'Pay when your order arrives'
                            : 'Pay when you arrive at the restaurant'),
                        value: 'cash',
                        groupValue: _selectedPaymentMethod,
                        onChanged: (value) {
                          setState(() {
                            _selectedPaymentMethod = value!;
                          });
                        },
                      ),
                    ),

                  const SizedBox(height: 32),

                  // Security Information
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primaryContainer
                          .withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: theme.colorScheme.primary.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.security,
                              color: theme.colorScheme.primary,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Secure Payment',
                              style: theme.textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Your payment information is encrypted and secure. We use Stripe for payment processing, which is trusted by millions of businesses worldwide.',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurface
                                .withValues(alpha: 0.8),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Payment Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _processPayment,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(
                        _selectedPaymentMethod == 'card'
                            ? 'Pay \$${widget.amount.toStringAsFixed(2)}'
                            : 'Confirm ${widget.type == 'order' ? 'Cash on Delivery' : 'Pay at Restaurant'}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Cancel Button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {
                        if (widget.onCancel != null) {
                          widget.onCancel!();
                        } else {
                          Navigator.of(context).pop(false);
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
