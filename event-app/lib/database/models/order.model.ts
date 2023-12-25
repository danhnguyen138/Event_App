import { Schema, model, models, Document } from "mongoose";



export interface IOrder extends Document{
    createAt: Date
    stripedId: string
    totalAmount: string
    event:{
        _id: string
        title: string
    },
    buyer:{
        _id: string
        firstName: string
        lastName: string 
    }
}

export type IOrderItem={
    _id: string
    totalAmount: string
    createdAt: Date
    eventTitle: string
    eventId: string
    buyer: string
}
const OrderSchema= new Schema({
    createAt:{
        type: Date,
        default: Date.now
    },
    stripedId:{
        type: String,
        required: true,
        unique: true
    },
    totalAmount:{
        type: String
    },
    event:{
        type: Schema.Types.ObjectId,
        ref: 'Event',
    },
    buyer:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Order= models.Order|| model('Order', OrderSchema)

export default Order