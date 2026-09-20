"use client";

import { useEffect, useRef } from "react";

/**
 * Home dashboard (filled state) — a static design export from the design tool.
 * Rendered verbatim for pixel fidelity; the only live behaviour is the "Ask Tumi"
 * launcher/chat toggle, wired up in the effect below. Tailwind scans this file,
 * so every class in the markup below is generated.
 */
const DASHBOARD_HTML = `<aside class="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="flex flex-col px-space-md"><div class="flex items-center gap-space-sm px-space-sm mb-space-xl"><img alt="Tuma Logo" class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHKFAw6gP2hPCPlYlG-OiYf1s-vtwFoDVAE4USKcbYw9IPXI75vF_K2wETttty3I8Q-ZjW8DJp7zoqLNexaU0JohbgNoexla5ezYm5o3ltNd8CRt6ZePoBeBDd1-YoIOgqAL6R31vTbY93OxYDKiaR3gJPWElzx2trPg80UtRrOAscXkXZfKYBmtdT77b5Oh-2VBq_u-ywodPGYnBj7b0CxkGhYhcfBOVE1PYe5TFB2hk1AHUCOYcf"><span class="font-headline-md text-headline-md text-on-surface tracking-tight">Tuma</span></div><nav class="flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary font-headline-sm"><a class="flex items-center gap-space-md px-space-md py-space-sm rounded-full hover:text-on-surface transition-all bg-primary-container text-on-primary font-headline-sm" data-path="home" href="/dashboard"><span class="font-label-lg text-label-lg">Home</span></a><a class="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="send" href="/send"><span class="font-label-lg text-label-lg">Send</span></a><a class="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="activity" href="/payments"><span class="font-label-lg text-label-lg">Activity</span></a><a class="flex items-center gap-space-md px-space-md py-space-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="profile" href="#"><span class="font-label-lg text-label-lg">Profile</span></a></nav></div><div class="px-space-md"><div class="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] flex flex-col gap-space-xs"><span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Active Corridor</span><div class="flex items-center justify-between"><span class="font-headline-sm text-headline-sm text-on-surface">USD / KES</span><span class="font-label-md text-label-md text-primary font-bold">128.40</span></div><span class="font-body-sm text-body-sm text-on-surface-variant">Zero fee on first 3 sends</span></div></div></aside><div class="pl-64 flex flex-col min-h-screen"><header class="fixed top-0 left-64 right-0 h-20 bg-surface/80 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"><div class="w-full h-20 px-space-xl flex items-center justify-between"><div class="flex items-center gap-space-md"><div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full text-on-surface-variant"><span class="material-symbols-outlined text-[20px]">search</span><input class="bg-transparent border-0 outline-none text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm w-72" placeholder="Search recipients, transactions, tags..." type="text"></div><div class="hidden xl:flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full"><span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span><span class="font-label-sm text-label-sm text-on-surface">FX Live: 1 USD = 1,485 NGN</span></div></div><div class="flex items-center gap-space-md"><div class="flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_4px_12px_rgba(26,24,22,0.03)]"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Balance</span><span class="font-headline-sm text-headline-sm text-on-surface">$8,420.50</span></div><button class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-[22px]">notifications</span></button><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main class="w-full pt-20 px-space-xl pb-space-xl flex-1 bg-background"><div class="flex flex-col w-full max-w-7xl mx-auto space-y-space-lg">
<!-- Top Greeting & Mascot Persona Banner -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
<div class="flex flex-col">
<div class="flex items-center gap-space-xs">
<h1 class="font-display-hero text-display-hero text-on-surface tracking-tight">Good evening, Sita 👋</h1>
</div>
<p class="font-body-lg text-body-lg text-on-surface-variant mt-1">Ready to send something?</p>
</div>
<!-- Tumi Mood Badge -->
<div class="inline-flex items-center gap-space-sm bg-surface-container-lowest py-space-xs px-space-md rounded-full shadow-[0_10px_25px_-5px_rgba(26,24,22,0.04)] self-start md:self-auto">
<div class="relative w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center overflow-hidden">
<img alt="Tumi Mascot" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1U3YQh5ndXkf4Wj1tPP45eaRpfGGi349UfItqd0mVCUwmYhDfDydveF-_iU0ZcbT3vSyaW6UYeohqPtYZ7bPzQw6k7DI5nTfEY4cs71JWZfLtk4drQQ4AG1A-p3LYbwuXYPb-mKOtEJFZ7oXejsdtcEXWQE-mYGADWe3P9uFR2Dm5snoYUSYP41cavc8AaDrSSNyBWK1L9o_HqTYQ6dnuwaf1VgIWmU_QzNz-rFXayAw0fGdcwIEOpP46k">
<span class="absolute bottom-0 right-0 w-3 h-3 bg-secondary-container rounded-full ring-2 ring-surface-container-lowest"></span>
</div>
<div class="flex flex-col pr-space-xs">
<span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Companion Mood</span>
<span class="font-label-lg text-label-lg text-on-surface flex items-center gap-1">
          Tumi is ready to fly <span class="animate-bounce">🚀</span>
</span>
</div>
</div>
</div>
<!-- Main Bento Content Grid -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
<!-- Primary Left Column: Wallet, CTAs, Recipients, Activity (8 Cols) -->
<div class="lg:col-span-8 flex flex-col gap-space-lg">
<!-- Radiant Tactile Wallet Card -->
<div class="relative overflow-hidden rounded-lg bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container p-space-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.05),0_8px_10px_-6px_rgba(26,24,22,0.02)]">
<!-- Subtle Vector Aura Decoration -->
<div class="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none"></div>
<div class="absolute right-6 bottom-4 opacity-5 pointer-events-none text-on-surface">
<span class="material-symbols-outlined text-[160px] leading-none">account_balance_wallet</span>
</div>
<div class="relative z-10 flex flex-col gap-space-md">
<!-- Card Top Bar: Badges -->
<div class="flex items-center justify-between">
<div class="flex items-center gap-space-xs">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Your wallet</span>
<span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-primary"></span> Primary NGN
              </span>
</div>
<div class="flex items-center gap-1 bg-surface-container-lowest px-space-sm py-1 rounded-full shadow-sm text-on-surface">
<span class="material-symbols-outlined text-[14px] text-secondary">lock</span>
<span class="font-label-sm text-label-sm font-semibold">Live rate locked</span>
</div>
</div>
<!-- Card Center: High-Contrast Balance Presentation -->
<div class="flex flex-col py-space-xs">
<div class="flex items-baseline gap-space-xs">
<span class="font-currency-display text-currency-display text-on-surface tracking-tight">₦84,500.00</span>
</div>
<div class="flex items-center gap-space-xs mt-1 text-on-surface-variant">
<span class="font-body-sm text-body-sm tracking-wide">Wallet •••• 7F29</span>
<button class="hover:text-on-surface transition-colors" title="Copy wallet identifier">
<span class="material-symbols-outlined text-[14px]">content_copy</span>
</button>
</div>
</div>
<!-- Bottom Micro-Telemetry inside Card -->
<div class="flex flex-wrap items-center justify-between pt-space-xs gap-space-xs">
<div class="flex items-center gap-space-sm">
<div class="flex -space-x-2 overflow-hidden">
<div class="inline-block h-6 w-6 rounded-full ring-2 ring-surface-container-lowest bg-primary-fixed flex items-center justify-center font-label-sm text-on-primary-fixed font-bold">M</div>
<div class="inline-block h-6 w-6 rounded-full ring-2 ring-surface-container-lowest bg-secondary-fixed flex items-center justify-center font-label-sm text-on-secondary-fixed font-bold">O</div>
<div class="inline-block h-6 w-6 rounded-full ring-2 ring-surface-container-lowest bg-tertiary-fixed flex items-center justify-center font-label-sm text-on-tertiary-fixed font-bold">K</div>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">3 trusted direct contacts</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Daily Transfer Limit: ₦500,000</span>
</div>
</div>
</div>
<!-- Action Suite: Bold Hero CTA & Auxiliary Buttons -->
<div class="grid grid-cols-1 sm:grid-cols-12 gap-space-sm items-center">
<!-- Primary Big Tactile Terracotta Send Button -->
<a href="/send" class="sm:col-span-7 group relative flex items-center justify-center gap-space-sm bg-primary-container hover:bg-primary text-on-primary py-space-md px-space-lg rounded-full font-headline-sm text-headline-sm transition-all duration-150 active:translate-y-0.5 shadow-[0_12px_24px_-6px_rgba(255,90,54,0.35),0_4px_0_#d63f1d] active:shadow-[0_4px_12px_-2px_rgba(255,90,54,0.2),0_1px_0_#d63f1d] cursor-pointer">
<span class="material-symbols-outlined text-[24px] transition-transform group-hover:scale-110 group-hover:rotate-12">rocket_launch</span>
<span class="">Send money</span>
<span class="w-1.5 h-1.5 rounded-full bg-surface-container-lowest ml-1 animate-ping"></span>
</a>
<!-- Secondary Tactile Chips -->
<div class="sm:col-span-5 grid grid-cols-2 gap-space-sm">
<button class="flex items-center justify-center gap-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface py-space-md px-space-sm rounded-full font-label-lg text-label-lg transition-all shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] cursor-pointer">
<span class="material-symbols-outlined text-[18px]">call_received</span>
<span class="">Request</span>
</button>
<button class="flex items-center justify-center gap-space-xs bg-surface-container-lowest hover:bg-surface-container text-on-surface py-space-md px-space-sm rounded-full font-label-lg text-label-lg transition-all shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] cursor-pointer">
<span class="material-symbols-outlined text-[18px]">add_circle</span>
<span class="">Add Cash</span>
</button>
</div>
</div>
<!-- Quick Send Favorites Carrousel / Shelf -->
<div class="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)]">
<div class="flex items-center justify-between px-space-xs">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Quick Recipients</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Tap to dispatch instantly</span>
</div>
<div class="flex items-center gap-space-md overflow-x-auto pb-space-xs pt-space-xs">
<!-- Add New Target -->
<button class="flex flex-col items-center gap-1 min-w-[72px] group cursor-pointer">
<div class="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary transition-all">
<span class="material-symbols-outlined text-[26px]">add</span>
</div>
<span class="font-label-md text-label-md text-on-surface font-semibold mt-1">New</span>
</button>
<!-- Mary -->
<button class="flex flex-col items-center gap-1 min-w-[72px] group cursor-pointer">
<div class="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-headline-sm text-headline-sm shadow-sm group-hover:scale-105 transition-transform">
              MK
            </div>
<div class="flex flex-col items-center mt-1">
<span class="font-label-md text-label-md text-on-surface font-semibold">Mary</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@mary_k</span>
</div>
</button>
<!-- Obad -->
<button class="flex flex-col items-center gap-1 min-w-[72px] group cursor-pointer">
<div class="w-14 h-14 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm shadow-sm group-hover:scale-105 transition-transform">
              OD
            </div>
<div class="flex flex-col items-center mt-1">
<span class="font-label-md text-label-md text-on-surface font-semibold">Obad</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@obad_d</span>
</div>
</button>
<!-- Khalid -->
<button class="flex flex-col items-center gap-1 min-w-[72px] group cursor-pointer">
<div class="w-14 h-14 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-headline-sm text-headline-sm shadow-sm group-hover:scale-105 transition-transform">
              KM
            </div>
<div class="flex flex-col items-center mt-1">
<span class="font-label-md text-label-md text-on-surface font-semibold">Khalid</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@khalid_m</span>
</div>
</button>
</div>
</div>
<!-- Recent Activity Section -->
<div class="flex flex-col gap-space-sm">
<div class="flex items-center justify-between px-space-xs">
<div class="flex items-center gap-space-xs">
<h2 class="font-headline-md text-headline-md text-on-surface">Recent activity</h2>
<span class="w-2 h-2 rounded-full bg-primary-container"></span>
</div>
<a class="font-label-lg text-label-lg text-primary hover:text-on-primary-container transition-colors flex items-center gap-1" href="/payments">
<span class="">View all</span>
<span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</a>
</div>
<!-- Activity Ledger Card Cluster -->
<div class="flex flex-col gap-space-xs bg-surface-container-lowest p-space-sm rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)]">
<!-- Row 1: Mary Received -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors gap-space-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 font-headline-sm text-headline-sm">
                MK
              </div>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg text-on-surface truncate">Mary</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@mary_k</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant mt-0.5">
<span class="font-body-sm text-body-sm truncate">Salary / Project split</span>
<span class="">•</span>
<span class="font-body-sm text-body-sm">Today, 4:15 PM</span>
</div>
</div>
</div>
<div class="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 pl-14 sm:pl-0">
<span class="font-headline-sm text-headline-sm text-primary font-bold">+₦12,000.00</span>
<span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> Completed
              </span>
</div>
</div>
<div class="h-px w-full bg-surface-container-low"></div>
<!-- Row 2: Obad Sent -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors gap-space-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 font-headline-sm text-headline-sm">
                OD
              </div>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg text-on-surface truncate">Obad</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@obad_d</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant mt-0.5">
<span class="font-body-sm text-body-sm truncate">Dinner &amp; drinks 🍕</span>
<span class="">•</span>
<span class="font-body-sm text-body-sm">Yesterday, 8:30 PM</span>
</div>
</div>
</div>
<div class="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 pl-14 sm:pl-0">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">-₦5,000.00</span>
<span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> Completed
              </span>
</div>
</div>
<div class="h-px w-full bg-surface-container-low"></div>
<!-- Row 3: Khalid Sent -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors gap-space-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 font-headline-sm text-headline-sm">
                KM
              </div>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg text-on-surface truncate">Khalid</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@khalid_m</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant mt-0.5">
<span class="font-body-sm text-body-sm truncate">Grocery run 🛒</span>
<span class="">•</span>
<span class="font-body-sm text-body-sm">Oct 22, 11:20 AM</span>
</div>
</div>
</div>
<div class="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 pl-14 sm:pl-0">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">-₦2,500.00</span>
<span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> Instant Settlement
              </span>
</div>
</div>
<div class="h-px w-full bg-surface-container-low"></div>
<!-- Row 4: Mama Sarah Received -->
<div class="flex flex-col sm:flex-row sm:items-center justify-between p-space-sm rounded-lg hover:bg-surface-container-low transition-colors gap-space-sm">
<div class="flex items-center gap-space-md min-w-0">
<div class="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 font-headline-sm text-headline-sm">
                MS
              </div>
<div class="flex flex-col min-w-0">
<div class="flex items-center gap-space-xs">
<span class="font-label-lg text-label-lg text-on-surface truncate">Mama Sarah</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@mama_sarah</span>
</div>
<div class="flex items-center gap-space-xs text-on-surface-variant mt-0.5">
<span class="font-body-sm text-body-sm truncate">Weekly family gift ❤️</span>
<span class="">•</span>
<span class="font-body-sm text-body-sm">Oct 20, 2:10 PM</span>
</div>
</div>
</div>
<div class="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 pl-14 sm:pl-0">
<span class="font-headline-sm text-headline-sm text-primary font-bold">+₦20,000.00</span>
<span class="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> Completed
              </span>
</div>
</div>
</div>
</div>
</div>
<!-- Secondary Right Column: Live Corridors & Companion Insights (4 Cols) -->
<div class="lg:col-span-4 flex flex-col gap-space-md">
<!-- Tumi Companion Insight Card -->
<div class="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] relative overflow-hidden">
<div class="flex items-start gap-space-sm">
<div class="w-12 h-12 rounded-full bg-secondary-fixed shrink-0 overflow-hidden">
<img alt="Tumi Mascot Helper" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1U3YQh5ndXkf4Wj1tPP45eaRpfGGi349UfItqd0mVCUwmYhDfDydveF-_iU0ZcbT3vSyaW6UYeohqPtYZ7bPzQw6k7DI5nTfEY4cs71JWZfLtk4drQQ4AG1A-p3LYbwuXYPb-mKOtEJFZ7oXejsdtcEXWQE-mYGADWe3P9uFR2Dm5snoYUSYP41cavc8AaDrSSNyBWK1L9o_HqTYQ6dnuwaf1VgIWmU_QzNz-rFXayAw0fGdcwIEOpP46k">
</div>
<div class="flex flex-col">
<div class="flex items-center gap-1">
<span class="font-label-lg text-label-lg text-on-surface font-bold">Tumi insight</span>
<span class="font-label-sm text-label-sm text-primary bg-primary-fixed px-1.5 py-0.2 rounded">Live tip</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
              Sending to bank accounts in Nigeria settles in under <span class="text-on-surface font-semibold">15 seconds</span> today!
            </p>
</div>
</div>
</div>
<!-- Corridor Exchange Card -->
<div class="bg-surface-container-lowest p-space-md rounded-lg shadow-[0_10px_25px_-5px_rgba(26,24,22,0.03)] flex flex-col gap-space-sm">
<div class="flex items-center justify-between">
<span class="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Exchange Benchmark</span>
<span class="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary">
<span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Live
          </span>
</div>
<div class="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-1">
<div class="flex items-center justify-between">
<span class="font-label-md text-label-md text-on-surface-variant">Active Pair</span>
<span class="font-label-lg text-label-lg text-on-surface font-bold">USD / NGN</span>
</div>
<div class="flex items-baseline justify-between mt-1">
<span class="font-headline-md text-headline-md text-on-surface">1 USD</span>
<span class="font-headline-md text-headline-md text-primary font-extrabold">1,485.00 NGN</span>
</div>
</div>
<!-- Velocity Indicator -->
<div class="flex items-center justify-between p-space-xs text-on-surface-variant font-body-sm text-body-sm">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-secondary">bolt</span>
<span class="">Median settlement speed</span>
</div>
<span class="font-label-md text-label-md text-on-surface font-bold">~4.2s</span>
</div>
<!-- SVG Mini Sparkline -->
<div class="pt-1 flex flex-col gap-1">
<div class="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
<span class="">24h Trend</span>
<span class="text-primary font-semibold">+0.4%</span>
</div>
<svg class="w-full h-10 text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 200 40">
<path d="M0 35 Q 30 32, 60 25 T 120 18 T 170 12 L 200 8" stroke="currentColor" stroke-linecap="round" stroke-width="2.5"></path>
<path d="M0 35 Q 30 32, 60 25 T 120 18 T 170 12 L 200 8 L 200 40 L 0 40 Z" fill="currentColor" fill-opacity="0.08"></path>
</svg>
</div>
</div>
<!-- Verified Security Seal & Trust Note -->
<div class="bg-surface-container-high/60 p-space-md rounded-lg flex items-center gap-space-sm">
<div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-secondary shrink-0 shadow-sm">
<span class="material-symbols-outlined text-[20px]">verified_user</span>
</div>
<div class="flex flex-col min-w-0">
<span class="font-label-md text-label-md text-on-surface font-semibold">Tuma SafeVault Protected</span>
<span class="font-body-sm text-body-sm text-on-surface-variant truncate">Zero hidden corridor fees • NDIC Insured Partner</span>
</div>
</div>
</div>
</div>
<!-- Interactive Tumi Support Chat Modal preview (toggled by the launcher) -->
<div class="fixed bottom-24 right-6 w-80 bg-surface-container-lowest rounded-lg shadow-[0_20px_32px_-8px_rgba(26,24,22,0.18)] p-space-md z-50 transition-all duration-200 transform scale-95 opacity-0 pointer-events-none flex flex-col gap-space-sm" id="tumi-chat-dialog">
<div class="flex items-center justify-between pb-space-xs">
<div class="flex items-center gap-space-xs">
<div class="w-8 h-8 rounded-full bg-secondary-fixed overflow-hidden shrink-0">
<img alt="Tumi Chat" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1U3YQh5ndXkf4Wj1tPP45eaRpfGGi349UfItqd0mVCUwmYhDfDydveF-_iU0ZcbT3vSyaW6UYeohqPtYZ7bPzQw6k7DI5nTfEY4cs71JWZfLtk4drQQ4AG1A-p3LYbwuXYPb-mKOtEJFZ7oXejsdtcEXWQE-mYGADWe3P9uFR2Dm5snoYUSYP41cavc8AaDrSSNyBWK1L9o_HqTYQ6dnuwaf1VgIWmU_QzNz-rFXayAw0fGdcwIEOpP46k">
</div>
<div class="flex flex-col">
<span class="font-label-md text-label-md text-on-surface font-bold">Ask Tumi</span>
<span class="font-label-sm text-label-sm text-primary flex items-center gap-1">● Always online</span>
</div>
</div>
<button class="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant" id="close-tumi-chat">
<span class="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
<div class="p-space-xs bg-surface-container-low rounded-lg text-on-surface font-body-sm text-body-sm">
      Hi Sita! How can I help you transfer funds or check live corridor exchange rates today?
    </div>
<div class="flex flex-col gap-1">
<button class="text-left px-space-sm py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors">
        💡 Why are transfers to Kenya so fast?
      </button>
<button class="text-left px-space-sm py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors">
        🔒 How is my NGN rate locked?
      </button>
</div>
<div class="flex items-center gap-space-xs pt-space-xs">
<input class="w-full bg-surface-container-low px-space-sm py-1.5 rounded-full font-body-sm text-body-sm text-on-surface outline-none" placeholder="Type message to Tumi..." type="text">
<button class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
<span class="material-symbols-outlined text-[16px]">send</span>
</button>
</div>
</div>
</div>
</main></div><button id="tumi-launcher" class="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm group cursor-pointer"><div class="bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-[0_12px_28px_-6px_rgba(26,24,22,0.12)] flex items-center gap-space-xs border border-surface-container-highest transition-transform group-hover:scale-105"><span class="w-2 h-2 rounded-full bg-secondary-container"></span><span class="font-label-md text-label-md text-on-surface font-semibold">Need help? Ask Tumi!</span></div><div class="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(26,24,22,0.16)] transition-transform group-hover:scale-110 active:scale-95"><span class="material-symbols-outlined text-[28px]">smart_toy</span></div></button>`;

export function HomeDashboard() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const dialog = root.querySelector<HTMLElement>("#tumi-chat-dialog");
    const launcher = root.querySelector<HTMLElement>("#tumi-launcher");
    const closeButton = root.querySelector<HTMLElement>("#close-tumi-chat");
    if (!dialog || !launcher) return;

    const open = () => {
      dialog.classList.remove("pointer-events-none", "scale-95", "opacity-0");
      dialog.classList.add("scale-100", "opacity-100");
    };
    const close = () => {
      dialog.classList.add("pointer-events-none", "scale-95", "opacity-0");
      dialog.classList.remove("scale-100", "opacity-100");
    };
    const onLauncher = (event: Event) => {
      event.stopPropagation();
      if (dialog.classList.contains("pointer-events-none")) open();
      else close();
    };
    const onClose = (event: Event) => {
      event.stopPropagation();
      close();
    };

    launcher.addEventListener("click", onLauncher);
    closeButton?.addEventListener("click", onClose);
    return () => {
      launcher.removeEventListener("click", onLauncher);
      closeButton?.removeEventListener("click", onClose);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="bg-background font-body-md text-body-md text-on-surface min-h-screen antialiased selection:bg-primary-fixed selection:text-on-primary-fixed"
      dangerouslySetInnerHTML={{ __html: DASHBOARD_HTML }}
    />
  );
}
