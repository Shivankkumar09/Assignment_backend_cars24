import { getDatabase } from './database.js';
import { logger } from '../config/logger.js';

interface SeedOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  status: string;
  amountInr: number;
  deliveryAddress: string | null;
  addressVerified: number;
  city: string | null;
  pincode: string | null;
  createdAt: string;
}

interface SeedPayment {
  id: string;
  orderId: string;
  gateway: string;
  status: string;
  amountInr: number;
  method: string;
  transactionRef: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface SeedDelivery {
  id: string;
  orderId: string;
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  scheduledAt: string | null;
  eta: string | null;
  delayReason: string | null;
  createdAt: string;
}

interface SeedDeliveryLog {
  id: string;
  deliveryId: string;
  eventType: string;
  message: string;
  location: string | null;
  createdAt: string;
}

const orders: SeedOrder[] = [
  {
    id: 'C24-ORD-1001',
    customerName: 'Ananya Sharma',
    customerPhone: '+91-9810011001',
    vehicleMake: 'Hyundai',
    vehicleModel: 'Creta SX',
    vehicleYear: 2021,
    status: 'delivered',
    amountInr: 1245000,
    deliveryAddress: '12, Golf Course Road, Sector 53, Gurugram',
    addressVerified: 1,
    city: 'Gurugram',
    pincode: '122002',
    createdAt: '2026-07-12T09:10:00.000Z',
  },
  {
    id: 'C24-ORD-1002',
    customerName: 'Rohit Mehra',
    customerPhone: '+91-9820022002',
    vehicleMake: 'Maruti',
    vehicleModel: 'Baleno Zeta',
    vehicleYear: 2020,
    status: 'confirmed',
    amountInr: 645000,
    deliveryAddress: null,
    addressVerified: 0,
    city: 'Noida',
    pincode: null,
    createdAt: '2026-08-02T11:22:00.000Z',
  },
  {
    id: 'C24-ORD-1003',
    customerName: 'Priya Nair',
    customerPhone: '+91-9830033003',
    vehicleMake: 'Honda',
    vehicleModel: 'City VX',
    vehicleYear: 2019,
    status: 'ready_for_delivery',
    amountInr: 812000,
    deliveryAddress: '88, MG Road, Bengaluru',
    addressVerified: 0,
    city: 'Bengaluru',
    pincode: '560001',
    createdAt: '2026-08-14T08:00:00.000Z',
  },
  {
    id: 'C24-ORD-1004',
    customerName: 'Vikram Singh',
    customerPhone: '+91-9840044004',
    vehicleMake: 'Tata',
    vehicleModel: 'Nexon EV',
    vehicleYear: 2022,
    status: 'processing',
    amountInr: 1390000,
    deliveryAddress: 'Plot 4, Hinjewadi Phase 1, Pune',
    addressVerified: 1,
    city: 'Pune',
    pincode: '411057',
    createdAt: '2026-08-20T14:45:00.000Z',
  },
  {
    id: 'C24-ORD-1005',
    customerName: 'Sana Qureshi',
    customerPhone: '+91-9850055005',
    vehicleMake: 'Mahindra',
    vehicleModel: 'XUV700 AX7',
    vehicleYear: 2023,
    status: 'processing',
    amountInr: 1875000,
    deliveryAddress: '221, Banjara Hills, Hyderabad',
    addressVerified: 1,
    city: 'Hyderabad',
    pincode: '500034',
    createdAt: '2026-08-22T07:30:00.000Z',
  },
  {
    id: 'C24-ORD-1006',
    customerName: 'Arjun Patel',
    customerPhone: '+91-9860066006',
    vehicleMake: 'Kia',
    vehicleModel: 'Seltos HTX',
    vehicleYear: 2021,
    status: 'pending',
    amountInr: 978000,
    deliveryAddress: '5, SG Highway, Ahmedabad',
    addressVerified: 1,
    city: 'Ahmedabad',
    pincode: '380054',
    createdAt: '2026-08-28T16:12:00.000Z',
  },
  {
    id: 'C24-ORD-1007',
    customerName: 'Neha Gupta',
    customerPhone: '+91-9870077007',
    vehicleMake: 'Toyota',
    vehicleModel: 'Innova Crysta',
    vehicleYear: 2018,
    status: 'cancelled',
    amountInr: 1560000,
    deliveryAddress: '19, Salt Lake Sector V, Kolkata',
    addressVerified: 1,
    city: 'Kolkata',
    pincode: '700091',
    createdAt: '2026-07-30T10:00:00.000Z',
  },
  {
    id: 'C24-ORD-1008',
    customerName: 'Karan Malhotra',
    customerPhone: '+91-9880088008',
    vehicleMake: 'Volkswagen',
    vehicleModel: 'Taigun GT',
    vehicleYear: 2022,
    status: 'ready_for_delivery',
    amountInr: 1422000,
    deliveryAddress: 'C-14, Vasant Kunj, New Delhi',
    addressVerified: 1,
    city: 'New Delhi',
    pincode: '110070',
    createdAt: '2026-08-18T12:18:00.000Z',
  },
  {
    id: 'C24-ORD-1009',
    customerName: 'Meera Iyer',
    customerPhone: '+91-9890099009',
    vehicleMake: 'Skoda',
    vehicleModel: 'Kushaq Style',
    vehicleYear: 2022,
    status: 'confirmed',
    amountInr: 1310000,
    deliveryAddress: 'Flat 9B, Adyar, Chennai',
    addressVerified: 1,
    city: 'Chennai',
    pincode: '600020',
    createdAt: '2026-08-25T09:40:00.000Z',
  },
  {
    id: 'C24-ORD-1010',
    customerName: 'Imran Khan',
    customerPhone: '+91-9900101010',
    vehicleMake: 'Renault',
    vehicleModel: 'Kiger RXT',
    vehicleYear: 2021,
    status: 'processing',
    amountInr: 712000,
    deliveryAddress: 'Warehouse hold — customer requested hub pickup',
    addressVerified: 1,
    city: 'Jaipur',
    pincode: '302017',
    createdAt: '2026-08-27T13:05:00.000Z',
  },
  {
    id: 'C24-ORD-1011',
    customerName: 'Divya Reddy',
    customerPhone: '+91-9910111111',
    vehicleMake: 'MG',
    vehicleModel: 'Hector Sharp',
    vehicleYear: 2020,
    status: 'delivered',
    amountInr: 1180000,
    deliveryAddress: '47, Jubilee Hills, Hyderabad',
    addressVerified: 1,
    city: 'Hyderabad',
    pincode: '500033',
    createdAt: '2026-06-15T06:20:00.000Z',
  },
  {
    id: 'C24-ORD-1012',
    customerName: 'Suresh Pillai',
    customerPhone: '+91-9920121212',
    vehicleMake: 'Ford',
    vehicleModel: 'EcoSport Titanium',
    vehicleYear: 2019,
    status: 'ready_for_delivery',
    amountInr: 689000,
    deliveryAddress: '31, Marine Drive, Kochi',
    addressVerified: 1,
    city: 'Kochi',
    pincode: '682031',
    createdAt: '2026-08-21T15:55:00.000Z',
  },
  {
    id: 'C24-ORD-1013',
    customerName: 'Pooja Desai',
    customerPhone: '+91-9930131313',
    vehicleMake: 'Jeep',
    vehicleModel: 'Compass Limited',
    vehicleYear: 2021,
    status: 'processing',
    amountInr: 2110000,
    deliveryAddress: 'Villa 2, Koregaon Park, Pune',
    addressVerified: 1,
    city: 'Pune',
    pincode: '411001',
    createdAt: '2026-08-29T11:00:00.000Z',
  },
  {
    id: 'C24-ORD-1014',
    customerName: 'Rahul Verma',
    customerPhone: '+91-9940141414',
    vehicleMake: 'Nissan',
    vehicleModel: 'Magnite XV',
    vehicleYear: 2022,
    status: 'pending',
    amountInr: 598000,
    deliveryAddress: 'Hostel Block C, IIT Delhi',
    addressVerified: 0,
    city: 'New Delhi',
    pincode: '110016',
    createdAt: '2026-09-01T18:40:00.000Z',
  },
  {
    id: 'C24-ORD-1015',
    customerName: 'Aisha Fernandes',
    customerPhone: '+91-9950151515',
    vehicleMake: 'Mercedes-Benz',
    vehicleModel: 'C-Class C200',
    vehicleYear: 2018,
    status: 'confirmed',
    amountInr: 2850000,
    deliveryAddress: 'Panaji waterfront — barge slot pending',
    addressVerified: 1,
    city: 'Panaji',
    pincode: '403001',
    createdAt: '2026-08-30T04:15:00.000Z',
  },
  {
    id: 'C24-ORD-1016',
    customerName: 'Harpreet Kaur',
    customerPhone: '+91-9960161616',
    vehicleMake: 'BMW',
    vehicleModel: 'X1 sDrive20i',
    vehicleYear: 2020,
    status: 'cancelled',
    amountInr: 2680000,
    deliveryAddress: '22, Sector 8, Chandigarh',
    addressVerified: 1,
    city: 'Chandigarh',
    pincode: '160009',
    createdAt: '2026-08-05T19:00:00.000Z',
  },
];

const payments: SeedPayment[] = [
  {
    id: 'PAY-2001',
    orderId: 'C24-ORD-1001',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 1245000,
    method: 'upi',
    transactionRef: 'rzp_ok_1001',
    failureReason: null,
    paidAt: '2026-07-12T09:18:00.000Z',
    createdAt: '2026-07-12T09:12:00.000Z',
  },
  {
    id: 'PAY-2002',
    orderId: 'C24-ORD-1002',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 645000,
    method: 'card',
    transactionRef: 'rzp_ok_1002',
    failureReason: null,
    paidAt: '2026-08-02T11:28:00.000Z',
    createdAt: '2026-08-02T11:24:00.000Z',
  },
  {
    id: 'PAY-2003',
    orderId: 'C24-ORD-1003',
    gateway: 'payu',
    status: 'succeeded',
    amountInr: 812000,
    method: 'netbanking',
    transactionRef: 'payu_ok_1003',
    failureReason: null,
    paidAt: '2026-08-14T08:08:00.000Z',
    createdAt: '2026-08-14T08:02:00.000Z',
  },
  {
    id: 'PAY-2004',
    orderId: 'C24-ORD-1004',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 1390000,
    method: 'upi',
    transactionRef: 'rzp_ok_1004',
    failureReason: null,
    paidAt: '2026-08-20T14:50:00.000Z',
    createdAt: '2026-08-20T14:46:00.000Z',
  },
  {
    id: 'PAY-2005',
    orderId: 'C24-ORD-1005',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 1875000,
    method: 'card',
    transactionRef: 'rzp_ok_1005',
    failureReason: null,
    paidAt: '2026-08-22T07:41:00.000Z',
    createdAt: '2026-08-22T07:33:00.000Z',
  },
  {
    id: 'PAY-2006a',
    orderId: 'C24-ORD-1006',
    gateway: 'razorpay',
    status: 'failed',
    amountInr: 978000,
    method: 'upi',
    transactionRef: 'rzp_fail_1006',
    failureReason: 'UPI collect expired — customer did not approve within 5 minutes',
    paidAt: null,
    createdAt: '2026-08-28T16:14:00.000Z',
  },
  {
    id: 'PAY-2006b',
    orderId: 'C24-ORD-1006',
    gateway: 'razorpay',
    status: 'pending',
    amountInr: 978000,
    method: 'upi',
    transactionRef: 'rzp_pend_1006',
    failureReason: null,
    paidAt: null,
    createdAt: '2026-08-28T16:40:00.000Z',
  },
  {
    id: 'PAY-2007',
    orderId: 'C24-ORD-1007',
    gateway: 'payu',
    status: 'refunded',
    amountInr: 1560000,
    method: 'card',
    transactionRef: 'payu_ref_1007',
    failureReason: 'Order cancelled by customer after RC mismatch',
    paidAt: '2026-07-30T10:12:00.000Z',
    createdAt: '2026-07-30T10:04:00.000Z',
  },
  {
    id: 'PAY-2008',
    orderId: 'C24-ORD-1008',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 1422000,
    method: 'netbanking',
    transactionRef: 'rzp_ok_1008',
    failureReason: null,
    paidAt: '2026-08-18T12:25:00.000Z',
    createdAt: '2026-08-18T12:19:00.000Z',
  },
  {
    id: 'PAY-2009',
    orderId: 'C24-ORD-1009',
    gateway: 'cash',
    status: 'pending',
    amountInr: 1310000,
    method: 'cash',
    transactionRef: null,
    failureReason: null,
    paidAt: null,
    createdAt: '2026-08-25T09:42:00.000Z',
  },
  {
    id: 'PAY-2010',
    orderId: 'C24-ORD-1010',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 712000,
    method: 'upi',
    transactionRef: 'rzp_ok_1010',
    failureReason: null,
    paidAt: '2026-08-27T13:09:00.000Z',
    createdAt: '2026-08-27T13:06:00.000Z',
  },
  {
    id: 'PAY-2011',
    orderId: 'C24-ORD-1011',
    gateway: 'payu',
    status: 'succeeded',
    amountInr: 1180000,
    method: 'card',
    transactionRef: 'payu_ok_1011',
    failureReason: null,
    paidAt: '2026-06-15T06:28:00.000Z',
    createdAt: '2026-06-15T06:21:00.000Z',
  },
  {
    id: 'PAY-2012',
    orderId: 'C24-ORD-1012',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 689000,
    method: 'upi',
    transactionRef: 'rzp_ok_1012',
    failureReason: null,
    paidAt: '2026-08-21T16:02:00.000Z',
    createdAt: '2026-08-21T15:56:00.000Z',
  },
  {
    id: 'PAY-2013',
    orderId: 'C24-ORD-1013',
    gateway: 'razorpay',
    status: 'succeeded',
    amountInr: 2110000,
    method: 'card',
    transactionRef: 'rzp_ok_1013',
    failureReason: null,
    paidAt: '2026-08-29T11:08:00.000Z',
    createdAt: '2026-08-29T11:01:00.000Z',
  },
  {
    id: 'PAY-2014',
    orderId: 'C24-ORD-1014',
    gateway: 'razorpay',
    status: 'failed',
    amountInr: 598000,
    method: 'card',
    transactionRef: 'rzp_fail_1014',
    failureReason: 'Bank declined — insufficient funds',
    paidAt: null,
    createdAt: '2026-09-01T18:42:00.000Z',
  },
  {
    id: 'PAY-2015',
    orderId: 'C24-ORD-1015',
    gateway: 'payu',
    status: 'succeeded',
    amountInr: 2850000,
    method: 'netbanking',
    transactionRef: 'payu_ok_1015',
    failureReason: null,
    paidAt: '2026-08-30T04:22:00.000Z',
    createdAt: '2026-08-30T04:16:00.000Z',
  },
  {
    id: 'PAY-2016',
    orderId: 'C24-ORD-1016',
    gateway: 'razorpay',
    status: 'refunded',
    amountInr: 2680000,
    method: 'card',
    transactionRef: 'rzp_ref_1016',
    failureReason: 'Finance rejection after payout hold',
    paidAt: '2026-08-05T19:12:00.000Z',
    createdAt: '2026-08-05T19:03:00.000Z',
  },
];

const deliveries: SeedDelivery[] = [
  {
    id: 'DEL-3001',
    orderId: 'C24-ORD-1001',
    status: 'delivered',
    carrier: 'Cars24 Fleet North',
    trackingNumber: 'C24FLT-1001',
    scheduledAt: '2026-07-14T03:00:00.000Z',
    eta: '2026-07-14T08:00:00.000Z',
    delayReason: null,
    createdAt: '2026-07-12T10:00:00.000Z',
  },
  {
    id: 'DEL-3002',
    orderId: 'C24-ORD-1002',
    status: 'unscheduled',
    carrier: null,
    trackingNumber: null,
    scheduledAt: null,
    eta: null,
    delayReason: 'Payment captured but delivery address is missing; ops must collect a complete drop point.',
    createdAt: '2026-08-02T11:30:00.000Z',
  },
  {
    id: 'DEL-3003',
    orderId: 'C24-ORD-1003',
    status: 'scheduled',
    carrier: 'Cars24 Fleet South',
    trackingNumber: 'C24FLT-1003',
    scheduledAt: '2026-09-12T02:30:00.000Z',
    eta: '2026-09-12T09:00:00.000Z',
    delayReason: 'Address on file is not KYC-verified; runner will call customer before dispatch.',
    createdAt: '2026-08-14T09:00:00.000Z',
  },
  {
    id: 'DEL-3004',
    orderId: 'C24-ORD-1004',
    status: 'delayed',
    carrier: 'Cars24 Fleet West',
    trackingNumber: 'C24FLT-1004',
    scheduledAt: '2026-08-24T03:00:00.000Z',
    eta: '2026-09-11T10:00:00.000Z',
    delayReason: 'RTO hold on interstate permit for EV — expected clearance 48h.',
    createdAt: '2026-08-20T15:00:00.000Z',
  },
  {
    id: 'DEL-3005',
    orderId: 'C24-ORD-1005',
    status: 'in_transit',
    carrier: 'Cars24 Fleet South',
    trackingNumber: 'C24FLT-1005',
    scheduledAt: '2026-09-08T01:00:00.000Z',
    eta: '2026-09-10T16:00:00.000Z',
    delayReason: null,
    createdAt: '2026-08-22T08:00:00.000Z',
  },
  {
    id: 'DEL-3006',
    orderId: 'C24-ORD-1006',
    status: 'unscheduled',
    carrier: null,
    trackingNumber: null,
    scheduledAt: null,
    eta: null,
    delayReason: 'Payment not captured; delivery slot cannot be created.',
    createdAt: '2026-08-28T16:45:00.000Z',
  },
  {
    id: 'DEL-3007',
    orderId: 'C24-ORD-1007',
    status: 'failed',
    carrier: 'Cars24 Fleet East',
    trackingNumber: 'C24FLT-1007',
    scheduledAt: '2026-08-04T03:00:00.000Z',
    eta: null,
    delayReason: 'Cancelled before dispatch after RC mismatch.',
    createdAt: '2026-07-30T11:00:00.000Z',
  },
  {
    id: 'DEL-3008',
    orderId: 'C24-ORD-1008',
    status: 'scheduled',
    carrier: 'Cars24 Fleet North',
    trackingNumber: 'C24FLT-1008',
    scheduledAt: '2026-09-11T02:00:00.000Z',
    eta: '2026-09-11T07:30:00.000Z',
    delayReason: null,
    createdAt: '2026-08-18T13:00:00.000Z',
  },
  {
    id: 'DEL-3009',
    orderId: 'C24-ORD-1009',
    status: 'unscheduled',
    carrier: null,
    trackingNumber: null,
    scheduledAt: null,
    eta: null,
    delayReason: 'Cash-on-delivery; slot opens only after 20% token at hub.',
    createdAt: '2026-08-25T09:50:00.000Z',
  },
  {
    id: 'DEL-3010',
    orderId: 'C24-ORD-1010',
    status: 'delayed',
    carrier: 'Cars24 Hub Pickup',
    trackingNumber: 'C24HUB-1010',
    scheduledAt: '2026-09-05T04:00:00.000Z',
    eta: '2026-09-12T12:00:00.000Z',
    delayReason: 'Customer changed from home delivery to Jaipur hub pickup; slot waitlisted.',
    createdAt: '2026-08-27T13:20:00.000Z',
  },
  {
    id: 'DEL-3011',
    orderId: 'C24-ORD-1011',
    status: 'delivered',
    carrier: 'Cars24 Fleet South',
    trackingNumber: 'C24FLT-1011',
    scheduledAt: '2026-06-18T03:00:00.000Z',
    eta: '2026-06-18T09:00:00.000Z',
    delayReason: null,
    createdAt: '2026-06-15T07:00:00.000Z',
  },
  {
    id: 'DEL-3012',
    orderId: 'C24-ORD-1012',
    status: 'failed',
    carrier: 'Cars24 Fleet South',
    trackingNumber: 'C24FLT-1012',
    scheduledAt: '2026-09-03T02:00:00.000Z',
    eta: '2026-09-10T11:00:00.000Z',
    delayReason: 'First attempt failed — customer unavailable; reattempt booked.',
    createdAt: '2026-08-21T16:10:00.000Z',
  },
  {
    id: 'DEL-3013',
    orderId: 'C24-ORD-1013',
    status: 'in_transit',
    carrier: 'Cars24 Premium West',
    trackingNumber: 'C24PRM-1013',
    scheduledAt: '2026-09-07T00:30:00.000Z',
    eta: '2026-09-10T18:00:00.000Z',
    delayReason: null,
    createdAt: '2026-08-29T11:20:00.000Z',
  },
  {
    id: 'DEL-3014',
    orderId: 'C24-ORD-1014',
    status: 'unscheduled',
    carrier: null,
    trackingNumber: null,
    scheduledAt: null,
    eta: null,
    delayReason: 'Hostel address failed verification; payment also failed.',
    createdAt: '2026-09-01T18:50:00.000Z',
  },
  {
    id: 'DEL-3015',
    orderId: 'C24-ORD-1015',
    status: 'delayed',
    carrier: 'Cars24 Premium West',
    trackingNumber: 'C24PRM-1015',
    scheduledAt: '2026-09-06T22:00:00.000Z',
    eta: '2026-09-14T15:00:00.000Z',
    delayReason: 'Goa barge capacity full through 12 Sep; vehicle staged at Panvel yard.',
    createdAt: '2026-08-30T05:00:00.000Z',
  },
  {
    id: 'DEL-3016',
    orderId: 'C24-ORD-1016',
    status: 'failed',
    carrier: 'Cars24 Fleet North',
    trackingNumber: 'C24FLT-1016',
    scheduledAt: null,
    eta: null,
    delayReason: 'Order cancelled; vehicle returned to inventory.',
    createdAt: '2026-08-05T20:00:00.000Z',
  },
];

const deliveryLogs: SeedDeliveryLog[] = [
  {
    id: 'LOG-4001',
    deliveryId: 'DEL-3001',
    eventType: 'dispatched',
    message: 'Vehicle left Manesar hub.',
    location: 'Manesar',
    createdAt: '2026-07-14T03:10:00.000Z',
  },
  {
    id: 'LOG-4002',
    deliveryId: 'DEL-3001',
    eventType: 'delivered',
    message: 'Customer signed POD. RC handover complete.',
    location: 'Gurugram',
    createdAt: '2026-07-14T07:42:00.000Z',
  },
  {
    id: 'LOG-4003',
    deliveryId: 'DEL-3002',
    eventType: 'blocked',
    message: 'Cannot schedule: delivery_address is NULL after successful capture.',
    location: 'Noida ops desk',
    createdAt: '2026-08-02T11:32:00.000Z',
  },
  {
    id: 'LOG-4004',
    deliveryId: 'DEL-3003',
    eventType: 'note',
    message: 'Address verification flag is false. Agent must confirm landmark with customer.',
    location: 'Bengaluru hub',
    createdAt: '2026-08-14T09:05:00.000Z',
  },
  {
    id: 'LOG-4005',
    deliveryId: 'DEL-3004',
    eventType: 'delay',
    message: 'Interstate EV permit pending at RTO Pune. Original 24 Aug slot slipped.',
    location: 'Pune RTO',
    createdAt: '2026-08-24T05:00:00.000Z',
  },
  {
    id: 'LOG-4006',
    deliveryId: 'DEL-3004',
    eventType: 'update',
    message: 'Permit expected in 48 hours. New ETA 11 Sep.',
    location: 'Pune hub',
    createdAt: '2026-09-09T08:00:00.000Z',
  },
  {
    id: 'LOG-4007',
    deliveryId: 'DEL-3005',
    eventType: 'in_transit',
    message: 'Carrier scanned at Nagpur transit yard.',
    location: 'Nagpur',
    createdAt: '2026-09-09T14:20:00.000Z',
  },
  {
    id: 'LOG-4008',
    deliveryId: 'DEL-3008',
    eventType: 'scheduled',
    message: 'Slot locked for 11 Sep morning window, Vasant Kunj.',
    location: 'New Delhi',
    createdAt: '2026-08-18T13:05:00.000Z',
  },
  {
    id: 'LOG-4009',
    deliveryId: 'DEL-3010',
    eventType: 'delay',
    message: 'Home delivery cancelled at customer request. Hub pickup waitlist position 4.',
    location: 'Jaipur hub',
    createdAt: '2026-09-05T06:00:00.000Z',
  },
  {
    id: 'LOG-4010',
    deliveryId: 'DEL-3012',
    eventType: 'attempt_failed',
    message: 'No one at Marine Drive address. Second attempt scheduled 10 Sep.',
    location: 'Kochi',
    createdAt: '2026-09-03T06:40:00.000Z',
  },
  {
    id: 'LOG-4011',
    deliveryId: 'DEL-3015',
    eventType: 'delay',
    message: 'Vehicle staged at Panvel. Next Goa barge 13 Sep evening.',
    location: 'Panvel yard',
    createdAt: '2026-09-06T23:00:00.000Z',
  },
  {
    id: 'LOG-4012',
    deliveryId: 'DEL-3013',
    eventType: 'in_transit',
    message: 'Premium enclosed carrier departed Pune inventory.',
    location: 'Pune',
    createdAt: '2026-09-07T01:10:00.000Z',
  },
];

export function seedDatabase(): void {
  const db = getDatabase();
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, customer_name, customer_phone, vehicle_make, vehicle_model, vehicle_year,
      status, amount_inr, delivery_address, address_verified, city, pincode, created_at
    ) VALUES (
      @id, @customerName, @customerPhone, @vehicleMake, @vehicleModel, @vehicleYear,
      @status, @amountInr, @deliveryAddress, @addressVerified, @city, @pincode, @createdAt
    )
  `);
  const insertPayment = db.prepare(`
    INSERT INTO payments (
      id, order_id, gateway, status, amount_inr, method, transaction_ref,
      failure_reason, paid_at, created_at
    ) VALUES (
      @id, @orderId, @gateway, @status, @amountInr, @method, @transactionRef,
      @failureReason, @paidAt, @createdAt
    )
  `);
  const insertDelivery = db.prepare(`
    INSERT INTO deliveries (
      id, order_id, status, carrier, tracking_number, scheduled_at, eta, delay_reason, created_at
    ) VALUES (
      @id, @orderId, @status, @carrier, @trackingNumber, @scheduledAt, @eta, @delayReason, @createdAt
    )
  `);
  const insertLog = db.prepare(`
    INSERT INTO delivery_logs (id, delivery_id, event_type, message, location, created_at)
    VALUES (@id, @deliveryId, @eventType, @message, @location, @createdAt)
  `);

  const run = db.transaction(() => {
    db.exec(`
      DELETE FROM delivery_logs;
      DELETE FROM deliveries;
      DELETE FROM payments;
      DELETE FROM orders;
    `);
    for (const order of orders) insertOrder.run(order);
    for (const payment of payments) insertPayment.run(payment);
    for (const delivery of deliveries) insertDelivery.run(delivery);
    for (const log of deliveryLogs) insertLog.run(log);
  });

  run();
  logger.info(
    {
      orders: orders.length,
      payments: payments.length,
      deliveries: deliveries.length,
      deliveryLogs: deliveryLogs.length,
    },
    'Seed complete',
  );
}

const isDirectRun = process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js');

if (isDirectRun) {
  seedDatabase();
}
