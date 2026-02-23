-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 20, 2026 at 09:15 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `monash`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `course_id` int NOT NULL,
  `course_code` varchar(6) NOT NULL,
  `course_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`course_id`, `course_code`, `course_name`, `created_at`, `updated_at`) VALUES
(1, 'SE', 'Bachelor of Software Engineering', '2025-01-10 08:00:00', '2025-01-10 08:00:00'),
(2, 'LAW', 'Bachelor of Laws', '2025-01-10 08:00:00', '2025-01-10 08:00:00'),
(3, 'MED', 'Bachelor of Medicine', '2025-01-10 08:00:00', '2025-01-10 08:00:00'),
(4, 'BUS', 'Bachelor of Business Administration', '2025-01-10 08:00:00', '2025-01-10 08:00:00'),
(5, 'CNET', 'Diploma of Computer Networking', '2026-02-20 06:53:08', '2026-02-20 06:53:08'),
(6, 'MECA', 'Diploma of Mechanical Engineering', '2026-02-20 09:13:38', '2026-02-20 09:13:38');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int NOT NULL,
  `student_number` varchar(10) NOT NULL,
  `mykad_number` char(12) NOT NULL,
  `email` varchar(255) NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `address` text,
  `gender` enum('Male','Female') DEFAULT NULL,
  `course_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_number`, `mykad_number`, `email`, `student_name`, `address`, `gender`, `course_id`, `created_at`, `updated_at`) VALUES
(1, 'SE0001', '020304101234', 'ahmad.se@monash.edu', 'Ahmad Bin Abdullah', 'Taman Selangor', 'Male', 1, '2025-02-01 09:00:00', '2026-02-20 06:53:47'),
(2, 'SE0002', '011205205678', 'siti.se@monash.edu', 'Siti Aminah Binti Yusof', 'Daera Kuala Lumpur', 'Female', 1, '2025-02-01 09:10:00', '2026-02-20 06:53:55'),
(3, 'SE0003', '030812089012', 'hafiz.se@monash.edu', 'Muhammad Hafiz Bin Aziz', 'Johor Bahru', 'Male', 1, '2025-02-01 09:20:00', '2025-02-01 09:20:00'),
(4, 'LAW0001', '991130143456', 'nurul.law@monash.edu', 'Nurul Ain Binti Razak', 'Pulau Pinang', 'Female', 2, '2025-02-02 09:00:00', '2025-02-02 09:00:00'),
(5, 'LAW0002', '000724107890', 'danial.law@monash.edu', 'Danial Bin Ismail', 'Perak', 'Male', 2, '2025-02-02 09:10:00', '2025-02-02 09:10:00'),
(6, 'MED0001', '021015162345', 'aisyah.med@gmail.com', 'Aisyah Binti Hassan', 'Negeri Sembilan', 'Female', 3, '2025-02-03 09:00:00', '2026-02-20 06:54:35'),
(7, 'MED0002', '010330056789', 'rizwan.med@gmail.com', 'Rizwan Bin Kamarudin', 'Kedah', 'Male', 3, '2025-02-03 09:10:00', '2026-02-20 06:55:59'),
(8, 'BUS0001', '030606131234', 'liyana.bus@gmail.com', 'Liyana Binti Othman', 'Melaka', 'Female', 4, '2025-02-04 09:00:00', '2026-02-20 06:55:53'),
(9, 'BUS0002', '020918175678', 'farhan.bus@gmail.com', 'Farhan Bin Zulkifli', 'Sabah', 'Male', 4, '2025-02-04 09:10:00', '2026-02-20 06:57:18'),
(10, 'CNET0001', '010203101111', 'hana.cnet@monash.edu', 'Hana Binti Sulaiman', 'Selangor', 'Female', 5, '2025-03-01 01:00:00', '2025-03-01 01:00:00'),
(11, 'CNET0002', '020507152222', 'irfan.cnet@monash.edu', 'Irfan Bin Nordin', 'Kuala Lumpur', 'Male', 5, '2025-03-01 01:10:00', '2025-03-01 01:10:00'),
(12, 'CNET0003', '030914083333', 'fara.cnet@monash.edu', 'Farahin Binti Zainudin', 'Pahang', 'Female', 5, '2025-03-01 01:20:00', '2025-03-01 01:20:00'),
(13, 'CNET0004', '991220194444', 'azri.cnet@monash.edu', 'Azri Bin Mahmud', 'Terengganu', 'Male', 5, '2025-03-01 01:30:00', '2025-03-01 01:30:00'),
(14, 'SE0004', '010811075555', 'nadia.se@monash.edu', 'Nadia Binti Ramli', 'Perlis', 'Female', 1, '2025-03-02 01:00:00', '2025-03-02 01:00:00'),
(15, 'LAW0003', '020122166666', 'zikri.law@monash.edu', 'Zikri Bin Fauzi', 'Kelantan', 'Male', 2, '2025-03-02 01:10:00', '2025-03-02 01:10:00'),
(16, 'MED0003', '030405097777', 'safiya.med@monash.edu', 'Safiya Binti Idris', 'Sarawak', 'Female', 3, '2025-03-02 01:20:00', '2025-03-02 01:20:00'),
(17, 'BUS0003', '000615128888', 'hakim.bus@monash.edu', 'Hakim Bin Shahril', 'Labuan', 'Male', 4, '2025-03-02 01:30:00', '2025-03-02 01:30:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `course_code_no` (`course_code`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `no_kp` (`mykad_number`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `matric_no` (`student_number`),
  ADD KEY `fk_student_course` (`course_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `course_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `students`
  MODIFY `student_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_student_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
