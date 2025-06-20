"use client";
import { usePathname } from "next/navigation";
import 'react-toastify/dist/ReactToastify.css';
import React, { useContext, useEffect } from 'react';
import { MainContext } from '@/context/context';

export default function Home() {
  const pathName = usePathname();

  const { getEvaluators } = useContext(MainContext);

  useEffect(() => {
    getEvaluators();

    if (typeof window !== 'undefined') {
      if (pathName === "/admin") window.location.href = "/admin/dashboard";

      if (!localStorage.getItem("token")) {
        window.location.href = "/login";
      }
    }
  }, []);

  return (
    <div>
    </div>
  )
}
