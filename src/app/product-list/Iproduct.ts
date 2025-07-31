export interface IProduct{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity:number;
    image: string;
    location: string;
    farmerId: string;
    farmerName: string;
    description: string;
    harvestDate: string;
    organic: boolean;
}

export const PRODUCTS: IProduct[] = [
  {
    id: '1',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 80,
    quantity: 50,
    image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Bhaktapur',
    farmerId: '1',
    farmerName: 'Ram Sharma',
    description: 'Fresh, organically grown tomatoes from local farms. Rich in vitamins and perfect for daily cooking. These tomatoes are grown without harmful pesticides and are harvested at peak ripeness.',
    harvestDate: '2024-01-10',
    organic: true
  },
  {
    id: '2',
    name: 'Organic Cauliflower',
    category: 'Vegetables',
    price: 60,
    quantity: 30,
    image: 'https://images.pexels.com/photos/1458736/pexels-photo-1458736.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Lalitpur',
    farmerId: '2',
    farmerName: 'Sita Devi',
    description: 'Fresh cauliflower grown without pesticides. Perfect for healthy cooking and nutritious meals. High in fiber and vitamin C.',
    harvestDate: '2024-01-12',
    organic: true
  },
  {
    id: '3',
    name: 'Fresh Spinach',
    category: 'Leafy Greens',
    price: 40,
    quantity: 25,
    image: 'https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Kathmandu',
    farmerId: '3',
    farmerName: 'Hari Bahadur',
    description: 'Fresh spinach leaves packed with iron and vitamins. Ideal for healthy salads and cooking. Grown in nutrient-rich soil.',
    harvestDate: '2024-01-14',
    organic: false
  },
  {
    id: '4',
    name: 'Red Apples',
    category: 'Fruits',
    price: 180,
    quantity: 40,
    image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Mustang',
    farmerId: '4',
    farmerName: 'Tenzin Sherpa',
    description: 'Sweet and crispy red apples from the mountains. Rich in fiber and natural sweetness. Grown at high altitude for better taste.',
    harvestDate: '2024-01-08',
    organic: true
  },
  {
    id: '5',
    name: 'Organic Carrots',
    category: 'Vegetables',
    price: 70,
    quantity: 35,
    image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Chitwan',
    farmerId: '5',
    farmerName: 'Maya Gurung',
    description: 'Fresh organic carrots rich in beta-carotene. Perfect for healthy snacking and cooking. Grown in fertile plains.',
    harvestDate: '2024-01-11',
    organic: true
  },
  {
    id: '6',
    name: 'Fresh Lettuce',
    category: 'Leafy Greens',
    price: 45,
    quantity: 20,
    image: 'https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Pokhara',
    farmerId: '6',
    farmerName: 'Binod Thapa',
    description: 'Crisp and fresh lettuce leaves. Perfect for salads and healthy eating. Grown in controlled environment.',
    harvestDate: '2024-01-13',
    organic: false
  },
  {
    id: '7',
    name: 'Green Beans',
    category: 'Vegetables',
    price: 90,
    quantity: 28,
    image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Bhaktapur',
    farmerId: '1',
    farmerName: 'Ram Sharma',
    description: 'Fresh green beans, tender and nutritious. Great source of vitamins and minerals. Perfect for stir-fries and curries.',
    harvestDate: '2024-01-09',
    organic: true
  },
  {
    id: '8',
    name: 'Sweet Potatoes',
    category: 'Vegetables',
    price: 65,
    quantity: 45,
    image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Chitwan',
    farmerId: '5',
    farmerName: 'Maya Gurung',
    description: 'Sweet and nutritious sweet potatoes. Rich in vitamins A and C. Perfect for roasting and baking.',
    harvestDate: '2024-01-07',
    organic: false
  },
  {
    id: '9',
    name: 'Fresh Oranges',
    category: 'Fruits',
    price: 120,
    quantity: 60,
    image: 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Pokhara',
    farmerId: '6',
    farmerName: 'Binod Thapa',
    description: 'Juicy and sweet oranges packed with vitamin C. Perfect for fresh juice and healthy snacking.',
    harvestDate: '2024-01-06',
    organic: true
  },
  {
    id: '10',
    name: 'Fresh Broccoli',
    category: 'Vegetables',
    price: 85,
    quantity: 22,
    image: 'https://images.pexels.com/photos/47347/broccoli-vegetable-food-healthy-47347.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Lalitpur',
    farmerId: '2',
    farmerName: 'Sita Devi',
    description: 'Fresh broccoli florets rich in nutrients. Excellent source of vitamin K and folate. Great for steaming and stir-fries.',
    harvestDate: '2024-01-12',
    organic: true
  },
  {
    id: '11',
    name: 'Red Onions',
    category: 'Vegetables',
    price: 55,
    quantity: 80,
    image: 'https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Kathmandu',
    farmerId: '3',
    farmerName: 'Hari Bahadur',
    description: 'Fresh red onions with strong flavor. Essential ingredient for cooking. Long shelf life and great taste.',
    harvestDate: '2024-01-05',
    organic: false
  },
  {
    id: '12',
    name: 'Fresh Bananas',
    category: 'Fruits',
    price: 100,
    quantity: 70,
    image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
    location: 'Chitwan',
    farmerId: '5',
    farmerName: 'Maya Gurung',
    description: 'Sweet and ripe bananas. Rich in potassium and natural sugars. Perfect for breakfast and smoothies.',
    harvestDate: '2024-01-14',
    organic: false
  }
];
