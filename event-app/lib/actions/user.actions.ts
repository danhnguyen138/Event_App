'use server'

import { revalidatePath } from "next/cache"
import { connectToDatabase } from "../database"
import User from "../database/models/user.model"
import Order from "../database/models/order.model"
import Event from "../database/models/event.model"
import { handleError } from '@/lib/utils'

import { CreateUserParams, UpdateUserParams } from '@/types';

export async function createUser(user: CreateUserParams) {
    try {
        await connectToDatabase();

        const newUser = await User.create(user);
        return JSON.parse(JSON.stringify(newUser))
    } catch (error) {
        handleError(error)
    }
}

export async function getUserById(userId: string) {
    try {
        await connectToDatabase();

        const user = await User.findById(userId)
        if (!user) throw new Error('User not found')
        return JSON.parse(JSON.stringify(user))
    } catch (error) {
        handleError(error)
    }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
    try {
        await connectToDatabase();

        const updateUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });

        if (!updateUser) throw new Error('User update failed');
        return JSON.parse(JSON.stringify(updateUser));
    } catch (error) {
        handleError(error)
    }
}

export async function deleteUser(clerkId: string) {
    try {
        await connectToDatabase();
        // Find user to delete
        const userDelete = await User.findById(clerkId);

        if (!userDelete) throw new Error('User not found');
        //Unlink relationships
        await Promise.all([
            // Update the 'events' collection to remove references to the user
            Event.updateMany(
                { _id: { $in: userDelete.events } },
                { $pull: { organizer: userDelete._id } }
            ),
            // Update the 'orders' collection to remove references to the user
            Order.updateMany(
                { _id: { $in: userDelete.orders } },
                { $unset: { buyer: 1 } }
            ),
        ])

        const deleteUser = await User.findByIdAndDelete(userDelete._id);
        revalidatePath('/')
        return deleteUser ? JSON.parse(JSON.stringify(deleteUser)) : null
    } catch (error) {
        handleError(error)
    }
}