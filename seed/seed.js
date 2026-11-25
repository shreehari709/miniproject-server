import mongoose from 'mongoose';
import '../config/loadEnv.js';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import AmbulanceRequest from '../models/AmbulanceRequest.js';
import Trip from '../models/Trip.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import LocationHistory from '../models/LocationHistory.js';
import Notification from '../models/Notification.js';

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected successfully.');

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      AmbulanceRequest.deleteMany({}),
      Trip.deleteMany({}),
      MaintenanceLog.deleteMany({}),
      FuelLog.deleteMany({}),
      Expense.deleteMany({}),
      LocationHistory.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Existing collections cleared.');

    // 1. Create Users
    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = 'password123';

    const usersToCreate = [
      {
        name: 'Prof. Rajesh Sharma (Super Admin)',
        email: 'admin@transitops.nitjsr.ac.in',
        password: defaultPassword,
        role: 'super_admin',
        phone: '+91 94311 20001',
        department: 'Estate & Transportation Division',
      },
      {
        name: 'Suresh Verma (Fleet Manager)',
        email: 'fleet@transitops.nitjsr.ac.in',
        password: defaultPassword,
        role: 'fleet_manager',
        phone: '+91 94311 20002',
        department: 'Fleet Operations Wing',
      },
      {
        name: 'Anita Roy (Assistant Fleet Manager)',
        email: 'fleet2@transitops.nitjsr.ac.in',
        password: defaultPassword,
        role: 'fleet_manager',
        phone: '+91 94311 20003',
        department: 'Fleet Operations Wing',
      },
      {
        name: 'Vikram Singh (Chief Dispatcher)',
        email: 'dispatch@transitops.nitjsr.ac.in',
        password: defaultPassword,
        role: 'dispatcher',
        phone: '+91 94311 20004',
        department: 'Emergency Transit Control Cell',
      },
      {
        name: 'Rohan Mehra (Night Dispatcher)',
        email: 'dispatch2@transitops.nitjsr.ac.in',
        password: defaultPassword,
        role: 'dispatcher',
        phone: '+91 94311 20005',
        department: 'Emergency Transit Control Cell',
      },
      {
        name: 'Kavita Iyer (Safety Officer)',
        email: 'safety@transitops.nitjsr.ac.in',
        password: defaultPassword,
        role: 'safety_officer',
        phone: '+91 94311 20006',
        department: 'Campus Compliance & Safety',
      },
      {
        name: 'Arun Prasad (Financial Analyst)',
        email: 'finance@transitops.nitjsr.ac.in',
        password: defaultPassword,
        role: 'financial_analyst',
        phone: '+91 94311 20007',
        department: 'Accounts & Logistics Audit',
      },
    ];

    // 5 Drivers
    const driverUsers = [
      { name: 'Rameshwar Kumar (Ambulance Lead)', email: 'driver1@transitops.nitjsr.ac.in', phone: '+91 98351 10001' },
      { name: 'Manoj Yadav (Emergency Specialist)', email: 'driver2@transitops.nitjsr.ac.in', phone: '+91 98351 10002' },
      { name: 'Sunil Mahato (Senior Ambulance Pilot)', email: 'driver3@transitops.nitjsr.ac.in', phone: '+91 98351 10003' },
      { name: 'Deepak Soren (Heavy Bus Driver)', email: 'driver4@transitops.nitjsr.ac.in', phone: '+91 98351 10004' },
      { name: 'Amitabh Mishra (Utility Driver)', email: 'driver5@transitops.nitjsr.ac.in', phone: '+91 98351 10005' },
    ];

    for (const d of driverUsers) {
      usersToCreate.push({
        ...d,
        password: defaultPassword,
        role: 'driver',
        department: 'Motor Transport Pool',
      });
    }

    // 10 Students
    const studentNames = [
      { name: 'Aarav Patel', id: '2023UGCS045', email: 'student1@transitops.nitjsr.ac.in', phone: '+91 82101 44001', dept: 'Computer Science & Engineering', hostel: 'Hostel I (Dr. B.R. Ambedkar Hall)' },
      { name: 'Pooja Kumari', id: '2023UGEC012', email: 'student2@transitops.nitjsr.ac.in', phone: '+91 82101 44002', dept: 'Electronics & Communication', hostel: 'Hostel IX (Rani Laxmi Bai Hall)' },
      { name: 'Rishabh Tiwari', id: '2022UGME089', email: 'student3@transitops.nitjsr.ac.in', phone: '+91 82101 44003', dept: 'Mechanical Engineering', hostel: 'Hostel E (Aryabhatta Hall)' },
      { name: 'Sneha Sengupta', id: '2024PGCA018', email: 'student4@transitops.nitjsr.ac.in', phone: '+91 82101 44004', dept: 'Master of Computer Applications', hostel: 'Hostel X (Gargi Hall)' },
      { name: 'Aniket Choudhury', id: '2022UGEE033', email: 'student5@transitops.nitjsr.ac.in', phone: '+91 82101 44005', dept: 'Electrical Engineering', hostel: 'Hostel C (C.V. Raman Hall)' },
      { name: 'Megha Gupta', id: '2023UGCE054', email: 'student6@transitops.nitjsr.ac.in', phone: '+91 82101 44006', dept: 'Civil Engineering', hostel: 'Hostel IX (Rani Laxmi Bai Hall)' },
      { name: 'Kunal Roy', id: '2021UGPI021', email: 'student7@transitops.nitjsr.ac.in', phone: '+91 82101 44007', dept: 'Production & Industrial', hostel: 'Hostel D (Visvesvaraya Hall)' },
      { name: 'Tanvi Agarwal', id: '2024PGCA042', email: 'student8@transitops.nitjsr.ac.in', phone: '+91 82101 44008', dept: 'Master of Computer Applications', hostel: 'Hostel X (Gargi Hall)' },
      { name: 'Rahul Murmu', id: '2023UGMM008', email: 'student9@transitops.nitjsr.ac.in', phone: '+91 82101 44009', dept: 'Metallurgical & Materials', hostel: 'Hostel B (Homi Bhabha Hall)' },
      { name: 'Divya Pandey', id: '2022UGCS101', email: 'student10@transitops.nitjsr.ac.in', phone: '+91 82101 44010', dept: 'Computer Science & Engineering', hostel: 'Hostel IX (Rani Laxmi Bai Hall)' },
    ];

    for (const s of studentNames) {
      usersToCreate.push({
        name: s.name,
        email: s.email,
        password: defaultPassword,
        role: 'student',
        studentId: s.id,
        phone: s.phone,
        department: s.dept,
        emergencyContact: {
          name: 'Parent / Campus Warden',
          relation: 'Guardian',
          phone: '+91 94311 99999',
        },
      });
    }

    const createdUsers = await User.create(usersToCreate);
    const userMap = new Map();
    createdUsers.forEach((u) => userMap.set(u.email, u));

    console.log(`[Seed] ${createdUsers.length} users created.`);

    // 2. Create Vehicles
    console.log('[Seed] Creating fleet vehicles...');
    const vehicleData = [
      {
        registrationNumber: 'JH-05-AMB-108',
        name: 'Force Traveller Advance Life Support (ALS) Ambulance 1',
        manufacturer: 'Force Motors',
        type: 'Ambulance',
        maxCapacity: 4,
        odometer: 18450,
        acquisitionCost: 2800000,
        purchaseDate: new Date('2022-04-15'),
        insuranceExpiry: new Date('2027-04-15'),
        registrationExpiry: new Date('2037-04-15'),
        fuelType: 'Diesel',
        region: 'NIT Jamshedpur Health Centre',
        currentLocation: { address: 'NIT Jamshedpur Health Centre', lat: 22.7766, lng: 86.1444 },
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80',
      },
      {
        registrationNumber: 'JH-05-AMB-102',
        name: 'Tata Winger Critical Care Ambulance 2',
        manufacturer: 'Tata Motors',
        type: 'Ambulance',
        maxCapacity: 4,
        odometer: 24100,
        acquisitionCost: 2100000,
        purchaseDate: new Date('2021-08-10'),
        insuranceExpiry: new Date('2027-08-10'),
        registrationExpiry: new Date('2036-08-10'),
        fuelType: 'Diesel',
        region: 'NIT Jamshedpur Health Centre',
        currentLocation: { address: 'NIT Jamshedpur Main Gate', lat: 22.7770, lng: 86.1450 },
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80',
      },
      {
        registrationNumber: 'JH-05-AMB-104',
        name: 'Mahindra Bolero Neo Ambulance 3',
        manufacturer: 'Mahindra',
        type: 'Ambulance',
        maxCapacity: 3,
        odometer: 12300,
        acquisitionCost: 1450000,
        purchaseDate: new Date('2023-01-20'),
        insuranceExpiry: new Date('2028-01-20'),
        registrationExpiry: new Date('2038-01-20'),
        fuelType: 'Diesel',
        region: 'NIT Jamshedpur Health Centre',
        currentLocation: { address: 'NIT Jamshedpur Health Centre', lat: 22.7766, lng: 86.1444 },
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80',
      },
      {
        registrationNumber: 'JH-05-BUS-201',
        name: 'Tata Starbus 40-Seater Campus Shuttle',
        manufacturer: 'Tata Motors',
        type: 'Bus',
        maxCapacity: 40,
        odometer: 64200,
        acquisitionCost: 3500000,
        purchaseDate: new Date('2020-03-01'),
        insuranceExpiry: new Date('2027-03-01'),
        registrationExpiry: new Date('2035-03-01'),
        fuelType: 'Diesel',
        region: 'Campus South Parking',
        currentLocation: { address: 'NIT Jamshedpur Central Garage', lat: 22.7750, lng: 86.1430 },
        status: 'Available',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      },
      {
        registrationNumber: 'JH-05-BUS-202',
        name: 'Ashok Leyland Sunshine 32-Seater',
        manufacturer: 'Ashok Leyland',
        type: 'Bus',
        maxCapacity: 32,
        odometer: 48900,
        acquisitionCost: 3100000,
        purchaseDate: new Date('2021-11-15'),
        insuranceExpiry: new Date('2026-11-15'),
        registrationExpiry: new Date('2036-11-15'),
        fuelType: 'Diesel',
        region: 'Campus South Parking',
        currentLocation: { address: 'Campus Central Workshop', lat: 22.7755, lng: 86.1438 },
        status: 'In Shop',
        notes: 'Undergoing routine brake pad overhaul & oil filter change',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      },
      {
        registrationNumber: 'JH-05-TRK-301',
        name: 'Eicher Pro 2049 Campus Logistics Truck',
        manufacturer: 'Eicher',
        type: 'Truck',
        maxCapacity: 2500,
        odometer: 31500,
        acquisitionCost: 1650000,
        purchaseDate: new Date('2022-07-20'),
        insuranceExpiry: new Date('2027-07-20'),
        registrationExpiry: new Date('2037-07-20'),
        fuelType: 'Diesel',
        region: 'Stores & Purchase Yard',
        currentLocation: { address: 'Central Warehouse Yard', lat: 22.7745, lng: 86.1425 },
        status: 'Available',
      },
      {
        registrationNumber: 'JH-05-VAN-401',
        name: 'Maruti Suzuki Eeco Utility Van',
        manufacturer: 'Maruti Suzuki',
        type: 'Van',
        maxCapacity: 7,
        odometer: 28400,
        acquisitionCost: 650000,
        purchaseDate: new Date('2022-09-05'),
        insuranceExpiry: new Date('2027-09-05'),
        registrationExpiry: new Date('2037-09-05'),
        fuelType: 'CNG',
        region: 'Admin Building Stand',
        currentLocation: { address: 'Admin Complex', lat: 22.7775, lng: 86.1460 },
        status: 'Available',
      },
      {
        registrationNumber: 'JH-05-CAR-501',
        name: 'Toyota Innova Crysta Director Escort Car',
        manufacturer: 'Toyota',
        type: 'Car',
        maxCapacity: 6,
        odometer: 42100,
        acquisitionCost: 2400000,
        purchaseDate: new Date('2021-02-14'),
        insuranceExpiry: new Date('2027-02-14'),
        registrationExpiry: new Date('2036-02-14'),
        fuelType: 'Diesel',
        region: 'Director Residence Stand',
        currentLocation: { address: 'NIT Director Bungalow', lat: 22.7780, lng: 86.1470 },
        status: 'Available',
      },
    ];

    const createdVehicles = await Vehicle.create(vehicleData);
    const vehicleMap = new Map();
    createdVehicles.forEach((v) => vehicleMap.set(v.registrationNumber, v));
    console.log(`[Seed] ${createdVehicles.length} vehicles created.`);

    // 3. Create Drivers
    console.log('[Seed] Creating drivers...');
    const driverData = [
      {
        user: userMap.get('driver1@transitops.nitjsr.ac.in')._id,
        fullName: 'Rameshwar Kumar',
        email: 'driver1@transitops.nitjsr.ac.in',
        phone: '+91 98351 10001',
        licenseNumber: 'JH-05-2015-DL-8821',
        licenseCategory: 'Emergency Vehicle',
        licenseExpiryDate: new Date('2028-09-30'),
        joiningDate: new Date('2018-05-10'),
        safetyScore: 98,
        rating: 4.9,
        assignedVehicle: vehicleMap.get('JH-05-AMB-108')._id,
        status: 'Available',
        totalTripsCompleted: 142,
        emergencyContact: { name: 'Sunita Devi', relation: 'Spouse', phone: '+91 98351 90001' },
      },
      {
        user: userMap.get('driver2@transitops.nitjsr.ac.in')._id,
        fullName: 'Manoj Yadav',
        email: 'driver2@transitops.nitjsr.ac.in',
        phone: '+91 98351 10002',
        licenseNumber: 'JH-05-2017-DL-4192',
        licenseCategory: 'Emergency Vehicle',
        licenseExpiryDate: new Date('2029-03-15'),
        joiningDate: new Date('2019-02-20'),
        safetyScore: 94,
        rating: 4.8,
        assignedVehicle: vehicleMap.get('JH-05-AMB-102')._id,
        status: 'Available',
        totalTripsCompleted: 118,
        emergencyContact: { name: 'Pramod Yadav', relation: 'Brother', phone: '+91 98351 90002' },
      },
      {
        user: userMap.get('driver3@transitops.nitjsr.ac.in')._id,
        fullName: 'Sunil Mahato',
        email: 'driver3@transitops.nitjsr.ac.in',
        phone: '+91 98351 10003',
        licenseNumber: 'JH-05-2012-DL-9932',
        licenseCategory: 'Emergency Vehicle',
        // Expiring in 20 days to demonstrate license expiry alert
        licenseExpiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        joiningDate: new Date('2016-01-11'),
        safetyScore: 91,
        rating: 4.7,
        assignedVehicle: vehicleMap.get('JH-05-AMB-104')._id,
        status: 'Available',
        totalTripsCompleted: 95,
        emergencyContact: { name: 'Geeta Mahato', relation: 'Spouse', phone: '+91 98351 90003' },
      },
      {
        user: userMap.get('driver4@transitops.nitjsr.ac.in')._id,
        fullName: 'Deepak Soren',
        email: 'driver4@transitops.nitjsr.ac.in',
        phone: '+91 98351 10004',
        licenseNumber: 'JH-05-2014-DL-6712',
        licenseCategory: 'Heavy Commercial',
        licenseExpiryDate: new Date('2028-12-10'),
        joiningDate: new Date('2017-08-01'),
        safetyScore: 89,
        rating: 4.6,
        assignedVehicle: vehicleMap.get('JH-05-BUS-201')._id,
        status: 'Available',
        totalTripsCompleted: 210,
        emergencyContact: { name: 'Rani Soren', relation: 'Spouse', phone: '+91 98351 90004' },
      },
      {
        user: userMap.get('driver5@transitops.nitjsr.ac.in')._id,
        fullName: 'Amitabh Mishra',
        email: 'driver5@transitops.nitjsr.ac.in',
        phone: '+91 98351 10005',
        licenseNumber: 'JH-05-2019-DL-1204',
        licenseCategory: 'Medium Transport',
        licenseExpiryDate: new Date('2029-06-25'),
        joiningDate: new Date('2020-04-15'),
        safetyScore: 96,
        rating: 4.9,
        assignedVehicle: vehicleMap.get('JH-05-TRK-301')._id,
        status: 'Available',
        totalTripsCompleted: 64,
        emergencyContact: { name: 'Sanjay Mishra', relation: 'Father', phone: '+91 98351 90005' },
      },
    ];

    const createdDrivers = await Driver.create(driverData);
    const driverMap = new Map();
    createdDrivers.forEach((d) => driverMap.set(d.email, d));
    console.log(`[Seed] ${createdDrivers.length} drivers created.`);

    // 4. Create Historical Trips & Fuel Logs & Expenses
    console.log('[Seed] Creating historical trips & expenses...');
    const student1 = userMap.get('student1@transitops.nitjsr.ac.in');
    const student2 = userMap.get('student2@transitops.nitjsr.ac.in');
    const student3 = userMap.get('student3@transitops.nitjsr.ac.in');
    const amb1 = vehicleMap.get('JH-05-AMB-108');
    const amb2 = vehicleMap.get('JH-05-AMB-102');
    const bus1 = vehicleMap.get('JH-05-BUS-201');
    const d1 = driverMap.get('driver1@transitops.nitjsr.ac.in');
    const d2 = driverMap.get('driver2@transitops.nitjsr.ac.in');
    const d4 = driverMap.get('driver4@transitops.nitjsr.ac.in');

    // 10 Completed Trips
    const completedTripsData = [
      {
        tripNumber: 'AMB-2026-1001',
        tripType: 'Ambulance',
        student: student1._id,
        passenger: student1._id,
        vehicle: amb1._id,
        driver: d1._id,
        source: { address: 'NIT Jamshedpur Hostel I', lat: 22.7766, lng: 86.1444 },
        destination: { address: 'Tata Main Hospital (TMH), Bistupur, Jamshedpur', lat: 22.8042, lng: 86.1905 },
        plannedDistance: 13.5,
        actualDistance: 14.2,
        outboundDistance: 7.1,
        returnDistance: 7.1,
        outboundDuration: 22,
        returnDuration: 18,
        totalDuration: 40,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
        status: 'Completed',
        fuelConsumed: 1.6,
        transportationCharge: 0,
        estimatedCost: 350,
        actualCost: 380,
        pickupVerifiedByDriver: true,
        pickupVerifiedByStudent: true,
        dropoffVerifiedByDriver: true,
        dropoffVerifiedByStudent: true,
      },
      {
        tripNumber: 'AMB-2026-1002',
        tripType: 'Ambulance',
        student: student2._id,
        passenger: student2._id,
        vehicle: amb2._id,
        driver: d2._id,
        source: { address: 'NIT Jamshedpur Hostel IX', lat: 22.7772, lng: 86.1455 },
        destination: { address: 'MGM Medical College & Hospital, Sakchi, Jamshedpur', lat: 22.7934, lng: 86.2230 },
        plannedDistance: 18.0,
        actualDistance: 18.8,
        outboundDistance: 9.4,
        returnDistance: 9.4,
        outboundDuration: 30,
        returnDuration: 25,
        totalDuration: 55,
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000),
        status: 'Completed',
        fuelConsumed: 2.1,
        transportationCharge: 0,
        estimatedCost: 480,
        actualCost: 510,
        pickupVerifiedByDriver: true,
        pickupVerifiedByStudent: true,
        dropoffVerifiedByDriver: true,
        dropoffVerifiedByStudent: true,
      },
      {
        tripNumber: 'TRP-2026-2001',
        tripType: 'General',
        passenger: student3._id,
        vehicle: bus1._id,
        driver: d4._id,
        source: { address: 'NIT Jamshedpur Campus Gate 1', lat: 22.7766, lng: 86.1444 },
        destination: { address: 'Tatanagar Railway Station', lat: 22.7680, lng: 86.2025 },
        plannedDistance: 11.0,
        actualDistance: 11.5,
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
        status: 'Completed',
        fuelConsumed: 4.2,
        transportationCharge: 200,
        estimatedCost: 420,
        actualCost: 440,
      },
    ];

    for (let i = 4; i <= 10; i++) {
      completedTripsData.push({
        tripNumber: `AMB-2026-100${i}`,
        tripType: 'Ambulance',
        student: student1._id,
        passenger: student1._id,
        vehicle: amb1._id,
        driver: d1._id,
        source: { address: 'NIT Jamshedpur Campus', lat: 22.7766, lng: 86.1444 },
        destination: { address: 'Tata Main Hospital (TMH), Jamshedpur', lat: 22.8042, lng: 86.1905 },
        plannedDistance: 14.0,
        actualDistance: 14.5,
        totalDuration: 42,
        startTime: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - (15 - i) * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        status: 'Completed',
        fuelConsumed: 1.7,
        actualCost: 390,
        pickupVerifiedByDriver: true,
        pickupVerifiedByStudent: true,
        dropoffVerifiedByDriver: true,
        dropoffVerifiedByStudent: true,
      });
    }

    const createdTrips = await Trip.create(completedTripsData);
    console.log(`[Seed] ${createdTrips.length} completed historical trips created.`);

    // 5. Create an Active Trip for Live Demo Evaluation
    console.log('[Seed] Creating live demo ambulance request and active trip...');
    const demoStudent = userMap.get('student1@transitops.nitjsr.ac.in');
    const demoAmbulance = vehicleMap.get('JH-05-AMB-108');
    const demoDriver = driverMap.get('driver1@transitops.nitjsr.ac.in');

    const demoRequest = await AmbulanceRequest.create({
      student: demoStudent._id,
      studentName: demoStudent.name,
      studentId: demoStudent.studentId,
      contactNumber: demoStudent.phone,
      emergencyContact: demoStudent.emergencyContact,
      pickupLocation: {
        address: 'Hostel I (Ambedkar Hall), NIT Jamshedpur Campus',
        lat: 22.7766,
        lng: 86.1444,
      },
      destinationHospital: {
        name: 'Tata Main Hospital (TMH)',
        address: 'C Road, Northern Town, Bistupur, Jamshedpur, Jharkhand 831001',
        lat: 22.8042,
        lng: 86.1905,
      },
      appointmentDate: new Date(),
      appointmentTime: '11:00 AM',
      requestType: 'Medical Appointment',
      medicalNotes: 'Acute ligament strain and medical follow-up consultation with orthopedic specialist.',
      status: 'Driver En Route',
      assignedAmbulance: demoAmbulance._id,
      assignedDriver: demoDriver._id,
      returnRequired: true,
    });

    const activeDemoTrip = await Trip.create({
      tripNumber: 'AMB-2026-LIVE-901',
      tripType: 'Ambulance',
      student: demoStudent._id,
      passenger: demoStudent._id,
      vehicle: demoAmbulance._id,
      driver: demoDriver._id,
      ambulanceRequest: demoRequest._id,
      source: demoRequest.pickupLocation,
      destination: {
        address: `${demoRequest.destinationHospital.name}, ${demoRequest.destinationHospital.address}`,
        lat: demoRequest.destinationHospital.lat,
        lng: demoRequest.destinationHospital.lng,
      },
      plannedDistance: 13.8,
      actualDistance: 4.2,
      startTime: new Date(),
      status: 'En Route',
      transportationCharge: 0,
      estimatedCost: 380,
      timeline: [
        {
          status: 'Dispatched',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          note: `Ambulance ${demoAmbulance.registrationNumber} dispatched to ${demoDriver.fullName}`,
        },
        {
          status: 'En Route',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          note: 'Driver en route to Hostel I pickup point',
        },
      ],
    });

    demoRequest.trip = activeDemoTrip._id;
    await demoRequest.save();

    // Mark vehicle and driver as 'On Trip'
    demoAmbulance.status = 'On Trip';
    await demoAmbulance.save();

    demoDriver.status = 'On Trip';
    await demoDriver.save();

    // Seed location history for the active trip
    await LocationHistory.create([
      {
        trip: activeDemoTrip._id,
        entityType: 'ambulance',
        coordinates: { lat: 22.7770, lng: 86.1450 }, // Near campus gate approaching hostel
        speed: 35,
        heading: 45,
        isSimulated: true,
      },
      {
        trip: activeDemoTrip._id,
        entityType: 'student',
        coordinates: { lat: 22.7766, lng: 86.1444 }, // Waiting at Hostel I
        accuracy: 8,
        isSimulated: true,
      },
    ]);

    // 6. Maintenance Logs
    console.log('[Seed] Creating maintenance logs...');
    await MaintenanceLog.create([
      {
        vehicle: vehicleMap.get('JH-05-BUS-202')._id,
        maintenanceType: 'Brake Inspection',
        description: 'Brake shoe replacement and master cylinder pressure bleed',
        serviceCenter: 'Tata Motors Authorized Commercial Service, Gamharia',
        estimatedCost: 8500,
        actualCost: 0,
        status: 'In Progress',
        reportedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        vehicle: amb1._id,
        maintenanceType: 'Routine Service',
        description: 'Engine oil filter change, air filter replacement, coolant top-up',
        serviceCenter: 'Force Service Hub, Bistupur',
        estimatedCost: 4500,
        actualCost: 4350,
        status: 'Completed',
        reportedDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
        invoiceNumber: 'INV-FMC-9812',
      },
      {
        vehicle: vehicleMap.get('JH-05-TRK-301')._id,
        maintenanceType: 'Tire Replacement',
        description: 'Front dual radial tire replacement with MRF Super Lug',
        serviceCenter: 'Apollo Tyres Commercial Hub, Adityapur',
        estimatedCost: 18000,
        actualCost: 17800,
        status: 'Completed',
        reportedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000),
        invoiceNumber: 'INV-TYR-4421',
      },
    ]);

    // 7. Fuel Logs
    console.log('[Seed] Creating fuel logs...');
    await FuelLog.create([
      {
        vehicle: amb1._id,
        fuelType: 'Diesel',
        liters: 45,
        pricePerLiter: 94.8,
        totalCost: 4266,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        odometerReading: 18450,
        fuelStation: 'Indian Oil Depot, Adityapur Main Road',
      },
      {
        vehicle: amb2._id,
        fuelType: 'Diesel',
        liters: 50,
        pricePerLiter: 94.8,
        totalCost: 4740,
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        odometerReading: 24100,
        fuelStation: 'Bharat Petroleum, Bistupur',
      },
      {
        vehicle: bus1._id,
        fuelType: 'Diesel',
        liters: 120,
        pricePerLiter: 94.8,
        totalCost: 11376,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        odometerReading: 64200,
        fuelStation: 'Campus Central Fuel Tank',
      },
      {
        vehicle: vehicleMap.get('JH-05-VAN-401')._id,
        fuelType: 'CNG',
        liters: 22,
        pricePerLiter: 79.5,
        totalCost: 1749,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        odometerReading: 28400,
        fuelStation: 'GAIL CNG Station, Gamharia',
      },
    ]);

    // 8. Other Expenses
    console.log('[Seed] Creating expense records...');
    await Expense.create([
      {
        vehicle: amb1._id,
        category: 'Tolls',
        amount: 80,
        description: 'Kharkai Bridge / Toll Plaza pass for emergency patient transport',
        recordedBy: userMap.get('admin@transitops.nitjsr.ac.in')._id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        vehicle: bus1._id,
        category: 'Driver Allowance',
        amount: 500,
        description: 'Night shuttle allowance for academic tour group',
        recordedBy: userMap.get('admin@transitops.nitjsr.ac.in')._id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        vehicle: amb2._id,
        category: 'Miscellaneous',
        amount: 450,
        description: 'Medical oxygen cylinder refill & pressure gauge sanitization',
        recordedBy: userMap.get('admin@transitops.nitjsr.ac.in')._id,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ]);

    // 9. Initial Notifications
    console.log('[Seed] Creating demo notifications...');
    await Notification.create([
      {
        recipient: demoStudent._id,
        title: 'Ambulance Dispatched (En Route)',
        message: 'Ambulance JH-05-AMB-108 with driver Rameshwar Kumar is en route to Hostel I.',
        type: 'emergency',
        link: `/tracking/${activeDemoTrip._id}`,
      },
      {
        roleRecipient: 'dispatcher',
        title: 'Ambulance JH-05-AMB-108 Active',
        message: 'Active emergency transit en route to Tata Main Hospital (TMH).',
        type: 'info',
        link: `/tracking/${activeDemoTrip._id}`,
      },
      {
        roleRecipient: 'safety_officer',
        title: 'Driver License Expiry Alert',
        message: 'Driver Sunil Mahato (JH-05-AMB-104) license expires in 20 days. Renewal required.',
        type: 'warning',
        link: '/drivers',
      },
      {
        roleRecipient: 'fleet_manager',
        title: 'Vehicle in Shop: JH-05-BUS-202',
        message: 'Brake inspection underway at Tata Motors Gamharia.',
        type: 'info',
        link: '/maintenance',
      },
    ]);

    console.log('====================================================');
    console.log('✅ TRANSITOPS DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Credentials for Evaluation:');
    console.log('Default Password for all accounts: password123');
    console.log('----------------------------------------------------');
    console.log('1. Super Admin:        admin@transitops.nitjsr.ac.in');
    console.log('2. Fleet Manager:      fleet@transitops.nitjsr.ac.in');
    console.log('3. Dispatcher:         dispatch@transitops.nitjsr.ac.in');
    console.log('4. Driver (Ambulance): driver1@transitops.nitjsr.ac.in');
    console.log('5. Student (Resident): student1@transitops.nitjsr.ac.in');
    console.log('6. Safety Officer:     safety@transitops.nitjsr.ac.in');
    console.log('7. Financial Analyst:  finance@transitops.nitjsr.ac.in');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
