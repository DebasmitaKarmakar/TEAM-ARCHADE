export const DEMO_PASSWORD = 'Demo@123';

export const DEMO_USERS = [
  { key: 'ananya', name: 'Ananya Das', email: 'shopper@blowmaggy.demo', role: 'SHOPPER', phone: '9864000001' },
  { key: 'kabir', name: 'Kabir Sharma', email: 'plus@blowmaggy.demo', role: 'SHOPPER', phone: '9810000002', member: true },
  { key: 'rahul', name: 'Rahul Bora', email: 'electronics.mgr@blowmaggy.demo', role: 'DEPT_MANAGER', dept: 'electronics', phone: '9864000003' },
  { key: 'meera', name: 'Meera Iyer', email: 'fashion.mgr@blowmaggy.demo', role: 'DEPT_MANAGER', dept: 'fashion', phone: '9840000004' },
  { key: 'sam', name: 'Sam Thomas', email: 'support@blowmaggy.demo', role: 'SUPPORT', phone: '9895000005' },
  { key: 'riya', name: 'Riya Sen', email: 'admin@blowmaggy.demo', role: 'ADMIN', phone: '9830000006' },
] as const;

export const DEMO_ADDRESSES = {
  ananya: [
    { label: 'Home', name: 'Ananya Das', phone: '9864000001', line1: 'House 12, Zoo Road', landmark: 'Near Rajgarh Link Road', city: 'Guwahati', state: 'Assam', pincode: '781024', isDefault: true },
    { label: 'Work', name: 'Ananya Das', phone: '9864000001', line1: '4th Floor, GS Road Tech Park', city: 'Guwahati', state: 'Assam', pincode: '781005', isDefault: false },
  ],
  kabir: [
    { label: 'Home', name: 'Kabir Sharma', phone: '9810000002', line1: 'B-204 Lake View Apartments', line2: 'Powai', city: 'Mumbai', state: 'Maharashtra', pincode: '400076', isDefault: true },
  ],
};

export const FIRST = ['Aarav', 'Diya', 'Rohan', 'Ishita', 'Vikram', 'Sneha', 'Arjun', 'Priya', 'Kunal', 'Meghna', 'Nikhil', 'Tanvi', 'Siddharth', 'Pooja', 'Aditya',
  'Riddhi', 'Manish', 'Kavya', 'Rahul', 'Neha', 'Imran', 'Fatima', 'Joel', 'Ruth', 'Bikash', 'Pallavi', 'Lalit', 'Anjali', 'Dhruv', 'Sana',
  'Karan', 'Ira', 'Varun', 'Nandini', 'Tenzin', 'Lhamo', 'Arnab', 'Moumita', 'Harsh', 'Zoya'];
export const LAST = ['Sharma', 'Baruah', 'Gogoi', 'Iyer', 'Reddy', 'Patel', 'Singh', 'Das', 'Khan', 'Mehta', 'Bose', 'Nair', 'Kapoor', 'Saikia', 'Lyngdoh', 'Sangma'];

export const CITIES = [
  { city: 'Guwahati', state: 'Assam', pincode: '781001' },
  { city: 'Shillong', state: 'Meghalaya', pincode: '793001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
  { city: 'New Delhi', state: 'Delhi', pincode: '110017' },
  { city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411014' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600042' },
  { city: 'Jaipur', state: 'Rajasthan', pincode: '302017' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
];
