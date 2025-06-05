import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../data/models/menu_item_model.dart';
import '../../../../services/menu_service.dart';
import '../../../providers/cart_provider.dart';
import 'menu_item_detail_screen.dart';
import '../../orders/cart_screen.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late Future<List<MenuItemModel>> _menuItemsFuture;
  late Future<List<String>> _categoriesFuture;
  final MenuService _menuService = MenuService();
  String _searchQuery = '';
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load categories and menu items
      _categoriesFuture = _menuService.getCategories();
      _menuItemsFuture = _menuService.getMenuItems();

      // Initialize tab controller after categories are loaded
      final categories = await _categoriesFuture;
      _tabController = TabController(length: categories.length, vsync: this);

      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = 'Failed to load menu data: $e';
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<MenuItemModel> _getFilteredItems(
      List<MenuItemModel> items, String category, String query) {
    return items.where((item) {
      // If "All" is selected, show all categories
      if (category == 'All') {
        // Filter by search query if any
        if (query.isNotEmpty) {
          return item.name.toLowerCase().contains(query.toLowerCase()) ||
              item.description.toLowerCase().contains(query.toLowerCase());
        }
        return true;
      }

      // Filter by category
      if (item.category != category) {
        return false;
      }

      // Filter by search query if any
      if (query.isNotEmpty) {
        return item.name.toLowerCase().contains(query.toLowerCase()) ||
            item.description.toLowerCase().contains(query.toLowerCase());
      }

      return true;
    }).toList();
  }

  Future<void> _refreshData() async {
    setState(() {
      _categoriesFuture = _menuService.getCategories();
      _menuItemsFuture = _menuService.getMenuItems();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                color: Colors.red,
                size: 60,
              ),
              const SizedBox(height: 16),
              Text(
                'Error',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(_error!),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadData,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return FutureBuilder<List<String>>(
      future: _categoriesFuture,
      builder: (context, categoriesSnapshot) {
        if (categoriesSnapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (categoriesSnapshot.hasError) {
          return Scaffold(
            body: Center(
              child: Text('Error: ${categoriesSnapshot.error}'),
            ),
          );
        }

        final categories = categoriesSnapshot.data ?? [];

        return Scaffold(
          appBar: AppBar(
            title: const Text('Restaurant Menu'),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: _refreshData,
              ),
              Consumer<CartProvider>(
                builder: (context, cart, child) {
                  return Stack(
                    alignment: Alignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.shopping_cart),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const CartScreen(),
                            ),
                          );
                        },
                      ),
                      if (cart.itemCount > 0)
                        Positioned(
                          right: 8,
                          top: 8,
                          child: Container(
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 16,
                              minHeight: 16,
                            ),
                            child: Text(
                              '${cart.itemCount}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
            ],
            bottom: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabs: categories.map((category) => Tab(text: category)).toList(),
              labelColor: Theme.of(context).colorScheme.primary,
              unselectedLabelColor: Colors.grey,
              indicatorSize: TabBarIndicatorSize.label,
            ),
          ),
          body: Column(
            children: [
              // Search bar
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  decoration: InputDecoration(
                    hintText: 'Search menu items...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                ),
              ),

              // Menu items list
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: categories.map((category) {
                    return FutureBuilder<List<MenuItemModel>>(
                      future: _menuItemsFuture,
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        }

                        if (snapshot.hasError) {
                          return Center(
                            child: Text('Error: ${snapshot.error}'),
                          );
                        }

                        final menuItems = snapshot.data ?? [];
                        final filteredItems = _getFilteredItems(
                            menuItems, category, _searchQuery);

                        if (filteredItems.isEmpty) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.restaurant_menu,
                                  size: 64,
                                  color: Colors.grey.shade300,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'No items found',
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleLarge
                                      ?.copyWith(
                                        color: Colors.grey.shade500,
                                      ),
                                ),
                              ],
                            ),
                          );
                        }

                        return RefreshIndicator(
                          onRefresh: _refreshData,
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: filteredItems.length,
                            itemBuilder: (context, index) {
                              final item = filteredItems[index];
                              return _buildMenuItem(context, item);
                            },
                          ),
                        );
                      },
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMenuItem(BuildContext context, MenuItemModel item) {
    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => MenuItemDetailScreen(menuItem: item),
          ),
        );
      },
      borderRadius: BorderRadius.circular(12),
      child: Card(
        margin: const EdgeInsets.only(bottom: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Item image
            SizedBox(
              height: 180,
              width: double.infinity,
              child: item.imageUrl != null
                  ? Image.network(
                      item.imageUrl,
                      fit: BoxFit.cover,
                    )
                  : Container(
                      color: Colors.grey.shade300,
                      child: Icon(
                        Icons.restaurant,
                        color: Colors.grey.shade600,
                        size: 48,
                      ),
                    ),
            ),

            // Item details
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.name,
                          style:
                              Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                        ),
                      ),
                      Text(
                        '\$${item.price.toStringAsFixed(2)}',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.description,
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      // Dietary info
                      if (item.isVegetarian)
                        _buildTag(context, 'Vegetarian', Colors.green),
                      if (item.isVegan)
                        _buildTag(context, 'Vegan', Colors.green),
                      if (item.isGlutenFree)
                        _buildTag(context, 'Gluten Free', Colors.orange),

                      const Spacer(),

                      // Rating
                      Row(
                        children: [
                          const Icon(
                            Icons.star,
                            color: Colors.amber,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            item.rating.toString(),
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTag(BuildContext context, String text, Color color) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
