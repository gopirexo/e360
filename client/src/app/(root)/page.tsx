"use client";
import { appName, serverURL } from '@/utils/utils';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaRobot } from 'react-icons/fa';
import { FiArrowRight, FiCloud, FiCreditCard, FiFileText, FiHome, FiLogIn, FiPlayCircle, FiSettings, FiUsers, FiX, FiZap } from 'react-icons/fi';

export default function Main() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [color, setColor] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [videoPreview, setVideoPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem("token")) {
        setLoggedIn(true);
      }
    }
  }, []);

  const changeColor = () => {
    if (window.scrollY >= window.innerHeight - 350) {
      setColor(true);
    } else {
      setColor(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', changeColor);
    return () => {
      window.removeEventListener('scroll', changeColor);
    };
  }, []);

  const features = [
    { icon: <FiUsers />, title: "Effortless Class Management", subtitle: "Create, organize, and add students with ease." },
    { icon: <FaRobot />, title: "AI-Powered Evaluation", subtitle: "Leverage cutting-edge AI for accurate and efficient grading." },
    { icon: <FiFileText />, title: "Detailed Result Insights", subtitle: "Explore detailed insights for a holistic view of student performance." },
    { icon: <FiCloud />, title: "SaaS Powered", subtitle: "Enjoy a scalable solution with an intuitive admin panel." },
    { icon: <FiCreditCard />, title: "Secure Payments", subtitle: "Multiple gateways for a hassle-free experience." }
  ];

  const howItWorks = [
    { title: "Create Classes & Evaluators", subtitle: "Organize classes, add students, and evaluators seamlessly." },
    { title: "Upload Answer Sheets", subtitle: `Upload question papers and answer keys. Let ${appName} AI handle the rest.` },
    { title: "Explore Detailed Results", subtitle: "Navigate 'All Students' for overview and 'Detailed View' for insights." },
  ];

  return (
    <main className="flex flex-col relative">
      {videoPreview && (
        <div className='fixed z-[999] video-preview w-full h-full bg-black p-20' onClick={() => setVideoPreview(false)}>
          <FiX className='text-4xl absolute top-5 right-5 text-white cursor-pointer' onClick={() => setVideoPreview(false)} />
          <iframe allowFullScreen className='w-full h-full' src="https://www.youtube.com/embed/hVurBDPrPOQ" title="How it works"></iframe>
        </div>
      )}

      <div id="home" className='pt-24 min-h-screen w-screen bg-gradient-to-b from-purple-400 via-violet-500 to-indigo-600 flex flex-col justify-center items-center'>
        <div className={"flex z-50 items-center justify-between fixed top-0 w-full p-3 md:px-10 duration-200 backdrop-blur-md border-b border-[rgba(255,255,255,0.1)] " + (color ? "bg-white text-black" : "text-white")}>
          <Link href="/"><div className="text-lg font-bold">🤖 {appName}</div></Link>
          <div className='hidden md:flex'>
            <Link href="#home"><label onClick={() => setSelectedTab(0)} className={'mr-5 btn btn-sm btn-ghost ' + (selectedTab === 0 ? "btn-active" : "")}>Home</label></Link>
            <Link href="#features"><label onClick={() => setSelectedTab(1)} className={'mr-5 btn btn-sm btn-ghost ' + (selectedTab === 1 ? "btn-active" : "")}>Features</label></Link>
            <Link href="#how-it-works"><label onClick={() => setSelectedTab(2)} className={'mr-5 btn btn-sm btn-ghost ' + (selectedTab === 2 ? "btn-active" : "")}>How it works</label></Link>
          </div>
          {loggedIn ? (
            <Link href="/home"><label className='btn btn-primary'><FiHome /> Home</label></Link>
          ) : (
            <Link href="/login"><label className='btn btn-primary'><FiLogIn /> Sign In</label></Link>
          )}
        </div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }} className='text-white font-black text-5xl md:text-7xl text-center'>Ultimate AI Answer Sheet Evaluator</motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 0.8, y: 0 }} transition={{ delay: 0.2 }} className='text-white text-center mt-5 text-md md:text-xl'>A powerful AI tool to evaluate answer sheets with ease and precision.</motion.p>
        <motion.button initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 btn btn-lg glass text-white btn-primary" onClick={() => setVideoPreview(true)}><FiPlayCircle /> See how it works</motion.button>
        <Link href={loggedIn ? "/home" : "/login"}><motion.button initial={{ opacity: 0, y: 30 }} animate={{ opacity: 0.7, y: 0 }} transition={{ delay: 0.6 }} className="mt-5 btn btn-sm text-white btn-ghost">{loggedIn ? "Go to home" : "Sign in"} <FiArrowRight /></motion.button></Link>
      </div>

      <div id="features" className='min-h-screen w-screen bg-white flex flex-col items-center py-20 md:p-20'>
        <h1 className='text-4xl md:text-5xl font-bold mb-20'>Features</h1>
        <div className='flex flex-wrap justify-evenly items-center w-full md:w-3/4'>
          {features.map((feature, i) => (
            <div key={i} className='flex group m-5'>
              <div className='bg-gray-100 group-hover:bg-black group-hover:text-white group-hover:scale-110 duration-200 text-3xl flex justify-center items-center w-20 h-20 rounded-lg mr-4'>
                {feature.icon}
              </div>
              <div className='flex flex-col'>
                <p className='text-xl font-semibold'>{feature.title}</p>
                <p className='text-lg max-w-sm'>{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="how-it-works" className='text-white min-h-screen w-screen flex flex-col items-center py-20 md:p-20 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700'>
        <h1 className='text-4xl md:text-5xl font-bold mb-20'>How does it work?</h1>
        <div className='flex flex-col md:flex-row flex-wrap justify-evenly items-center w-full md:w-3/4'>
          {howItWorks.map((step, i) => (
            <div key={i} className='flex flex-col group m-5 max-w-xs items-center'>
              <div className='group-hover:scale-110 group-hover:bg-white group-hover:text-black duration-200 text-2xl border border-[rgba(255,255,255,0.2)] rounded-full p-5 w-16 md:w-20 h-16 md:h-20 flex justify-center items-center'>{i + 1}</div>
              <p className='text-center mt-10 text-2xl'>{step.title}</p>
              <p className='text-center mt-5 text-xl opacity-65'>{step.subtitle}</p>
            </div>
          ))}
        </div>
        <button className="mt-10 btn btn-md md:btn-lg glass text-white btn-primary" onClick={() => setVideoPreview(true)}><FiPlayCircle /> See how it works</button>
      </div>

      <div className='text-white w-screen flex flex-col items-center py-20 md:px-32 bg-black'>
        <div className='w-full flex flex-col md:flex-row items-center justify-between'>
          <Link href="/home"><div className="text-lg font-bold">🤖 {appName}</div></Link>
          <div className='mt-10 md:mt-0 flex flex-col md:flex-row items-center'>
            <Link className='flex items-center my-2 md:ml-10' href="#"><p>Instagram</p></Link>
            <Link className='flex items-center my-2 md:ml-10' href="#"><p>X</p></Link>
            <Link className='flex items-center my-2 md:ml-10' href="#"><p>Facebook</p></Link>
          </div>
        </div>
        <div className="divider divider-neutral"></div>
        <p>© 2024 {appName}. All rights reserved.</p>
      </div>
    </main>
  );
}