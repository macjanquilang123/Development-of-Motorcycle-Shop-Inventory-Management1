-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2025 at 04:16 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `motorcycle_parts_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `created_at`) VALUES
(1, 'Spark Plug', '2025-03-27 08:29:24'),
(2, 'Tire', '2025-03-27 08:29:33'),
(3, 'Motor Oil', '2025-03-27 08:31:34'),
(4, 'Exhaust', '2025-03-27 10:03:55'),
(10, 'Air Filter', '2025-03-29 00:36:11'),
(11, 'Fuel Filter', '2025-03-30 09:50:24'),
(25, 'Oil Filter', '2025-05-12 10:34:59');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `name`, `category_id`, `supplier_id`, `price`, `quantity`, `created_at`, `image`) VALUES
(1, 'Castrol Activ Oil 1Liter', 3, 2, 240.00, 0, '2025-04-02 01:37:23', '/uploads/1747617977470-Castrol Activ Oil 1Liter.jpg'),
(2, 'NGK Standard Spark Plug c7hsa', 1, 1, 220.00, 39, '2025-04-08 09:55:32', '/uploads/1744106132269-Spark plug.png'),
(5, 'HIFLOFILTRO PREMIUM MOTORCYCLE OIL FILTERS HF204', 25, 8, 500.00, 9, '2025-04-21 17:49:06', '/uploads/1747046124296-Oil Filter1.webp'),
(8, 'Universal 38-51mm SC Moto Silencer Motorcycle Exhaust Muffler', 4, 5, 2250.00, 9, '2025-05-12 13:45:18', '/uploads/1747057518245-Universal 38-51mm SC Moto Silencer Motorcycle Exhaust Muffler.jfif'),
(9, 'Air Filter 50mm', 10, 5, 300.00, 20, '2025-05-12 13:54:02', '/uploads/1747058042967-Air Filter Unversal.webp'),
(10, 'Air Filter 55mm', 10, 5, 350.00, 24, '2025-05-12 13:55:04', '/uploads/1747058104703-Air Filter Unversal.webp'),
(13, 'asdsda', 4, 1, 2322.00, 25, '2025-05-19 01:38:12', '/uploads/1747618692005-Castrol Activ Oil 1Liter.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `sale_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(10,2) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `sale_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`sale_id`, `product_id`, `product_name`, `customer_name`, `quantity`, `price`, `discount`, `total_price`, `payment_type`, `sale_date`) VALUES
(17, 9, 'Air Filter 50mm', 'Jon Snow', 2, 300.00, 0.00, 600.00, 'cash', '2025-05-13'),
(18, 1, 'Castrol Activ Oil 1Liter', '', 2, 240.00, 0.00, 480.00, 'cash', '2025-05-16'),
(19, 2, 'NGK Standard Spark Plug c7hsa', '', 1, 220.00, 0.00, 220.00, 'cash', '2025-05-16'),
(20, 5, 'HIFLOFILTRO PREMIUM MOTORCYCLE OIL FILTERS HF204', '', 1, 500.00, 0.00, 500.00, 'cash', '2025-05-16'),
(21, 8, 'Universal 38-51mm SC Moto Silencer Motorcycle Exhaust Muffler', 'Mansanitas', 4, 2250.00, 500.00, 8500.00, 'cash', '2025-05-17'),
(22, 1, 'Castrol Activ Oil 1Liter', '', 7, 240.00, 0.00, 1680.00, 'cash', '2025-05-19'),
(23, 1, 'Castrol Activ Oil 1Liter', '', 14, 240.00, 0.00, 3240.00, 'cash', '2025-05-19'),
(24, 1, 'Castrol Activ Oil 1Liter', '', 1, 240.00, 0.00, 240.00, 'cash', '2025-05-19');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_info` text DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `name`, `contact_info`, `address`, `created_at`) VALUES
(1, 'Jon Snow', '09815352539', 'Zone 69, Winterfell, Westeros', '2025-03-30 11:44:42'),
(2, 'Daemon Targaryen', '09815352539', 'Mohon,Tagoloan, Mis Or.', '2025-04-03 10:50:20'),
(5, 'Stannis Baratheon', '09343433322', 'Zone 1, Dragonstone, Westeros', '2025-04-08 09:31:47'),
(7, 'Doctor D', '0969696969', 'Japan Third Floor', '2025-05-09 10:51:18'),
(8, 'Walter White', '0969 3222 2223', 'Poblacion, Tagoloan, Mis. Or.', '2025-05-12 07:57:39');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('admin','staff','cashier') DEFAULT 'staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(2, 'admin', '$2b$10$WDuojojvvhk27mIJkK3L1.tTGduM2s5kSuSetQP68Z90JyF5myhJG', 'admin', '2025-03-23 06:29:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `supplier_id` (`supplier_id`),
  ADD KEY `products_ibfk_1` (`category_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`sale_id`),
  ADD KEY `sales_ibfk_1` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `sale_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON DELETE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
