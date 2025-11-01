export interface IProduct{
    id: number | string; // Can be number (for dummy data) or string (MongoDB _id)
    _id?: string; // MongoDB ObjectId as string
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

