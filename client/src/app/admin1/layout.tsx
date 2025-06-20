"use client";
import React from 'react';
import Dashboard from './dashboard';
import { ToastContainer } from 'react-toastify';
import { Context } from '@/context/context';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (<Context><Dashboard>{children}</Dashboard><ToastContainer /></Context>)
}
