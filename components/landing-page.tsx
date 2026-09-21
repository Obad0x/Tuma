/**
 * Tuma marketing landing page.
 *
 * Static design export rendered verbatim (no user input) for pixel fidelity.
 * Copy is written around the real product: send USDC to an X handle on Arc,
 * held in escrow, claimed with one login. Tailwind scans this file.
 */
const LANDING_HTML = `<header class="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(26,24,22,0.03)]"><div class="h-20 max-w-7xl mx-auto px-gutter-desktop flex items-center justify-between"><div class="flex items-center gap-space-xl"><a class="flex items-center gap-space-sm focus:outline-none" data-path="home" href="/"><img alt="Tuma logo" class="h-8 w-auto object-contain" src="/images/tuma-logo.jpg"><span class="font-headline-md text-headline-md text-on-surface tracking-tight hidden sm:inline">Tuma</span></a><nav class="hidden lg:flex items-center gap-space-lg"><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">How it works</a><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#product">Product</a><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="#security">Security</a><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" href="/payments">Activity</a></nav></div><div class="flex items-center gap-space-md"><a class="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface px-space-md py-space-sm rounded-full transition-colors" href="/dashboard">Open app</a><a class="inline-flex items-center justify-center font-label-lg text-label-lg text-on-primary bg-primary-container hover:bg-primary shadow-[0_4px_0_#b52603] active:translate-y-[2px] active:shadow-[0_2px_0_#b52603] px-space-lg py-space-sm rounded-full transition-all" href="/send">Get started</a><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main class="w-full pt-20 bg-background flex-1"><div class="flex flex-col w-full">
<!-- Top Ambient Glow Field -->
<div class="relative w-full overflow-hidden">
<div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[780px] h-[520px] bg-gradient-to-b from-primary-fixed/40 via-secondary-fixed/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
<div class="absolute top-96 right-[-80px] w-96 h-96 bg-primary-container/10 rounded-full blur-2xl pointer-events-none -z-10"></div>
<div class="absolute top-48 left-[-100px] w-80 h-80 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none -z-10"></div>
<!-- 1. HERO SECTION -->
<section class="max-w-7xl mx-auto px-gutter-desktop pt-space-xl pb-24 relative">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
<!-- Left Hero Copy Column -->
<div class="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
<!-- Trust Badge -->
<div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container shadow-sm border-0 hover:bg-surface-container-high transition-colors">
<span class="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
<span class="font-label-md text-label-md text-on-surface-variant font-semibold">Escrowed on-chain • Claim with one 𝕏 login • No wallet needed</span>
</div>
<!-- Main Hero Display Headline -->
<h1 class="font-display-hero text-display-hero text-on-surface tracking-tight leading-[1.08] max-w-2xl">
            Send USDC to any <span class="text-primary-container relative inline-block">𝕏 handle<svg class="absolute -bottom-2 left-0 w-full text-secondary-container h-2.5 pointer-events-none" fill="none" preserveAspectRatio="none" viewBox="0 0 160 12"><path d="M2 9.5C40 2 120 2 158 9.5" stroke="currentColor" stroke-linecap="round" stroke-width="4"></path></svg></span>.
          </h1>
<!-- Hero Subtitle -->
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
            They claim it with one login. The money sits safely in an on-chain escrow on Arc until then — no wallet, no gas, and no setup for the recipient.
          </p>
<!-- CTAs -->
<div class="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_6px_0_#b52603] active:translate-y-1 active:shadow-[0_2px_0_#b52603] transition-all duration-150" href="/send">
<span class="">Send USDC</span>
<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</a>
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high active:scale-[0.98] transition-all" href="#how-it-works">
<span class="material-symbols-outlined text-[20px] text-primary">play_circle</span>
<span class="">See how it works</span>
</a>
</div>
<!-- Proof Markers -->
<div class="pt-6 flex flex-wrap items-center gap-6 text-on-surface-variant">
<div class="flex -space-x-2 overflow-hidden">
<img alt="A Tuma sender" class="inline-block h-10 w-10 rounded-full ring-2 ring-surface object-cover" src="/images/avatar.jpg">
<div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm ring-2 ring-surface font-bold">MK</div>
<div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm ring-2 ring-surface font-bold">OD</div>
<div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm ring-2 ring-surface font-bold">𝕏</div>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-1 text-secondary">
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-sm text-label-sm text-on-surface font-bold ml-1">Escrow-backed</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Deposits enforced in code • Refundable after 30 days</span>
</div>
</div>
</div>
<!-- Right Hero Interactive Visual Showcase -->
<div class="lg:col-span-5 relative flex items-center justify-center">
<!-- Outer Soft Halo -->
<div class="w-full max-w-md aspect-square bg-gradient-to-tr from-secondary-container/30 via-primary-container/20 to-tertiary-container/30 rounded-3xl p-6 relative flex items-center justify-center shadow-xl">
<!-- Center Tumi Mascot Visual -->
<div class="relative z-10 flex flex-col items-center">
<img alt="Tumi the friendly mascot delivering a USDC payment to an X handle" class="w-72 h-72 sm:w-84 sm:h-84 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300" src="/images/tumi-hero.jpg">
</div>
<!-- Floating Pill 1: Claim Notification -->
<div class="absolute -top-4 -left-4 sm:-left-8 z-20 bg-surface-container-lowest p-3.5 pr-5 rounded-2xl shadow-[0_12px_28px_-6px_rgba(26,24,22,0.12)] flex items-center gap-3 animate-bounce" style="animation-duration: 4s;">
<img alt="A Tuma recipient" class="w-10 h-10 rounded-full object-cover" src="/images/avatar.jpg">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Claimed with one login</span>
<div class="flex items-center gap-1.5">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">+25.00 USDC</span>
<span class="material-symbols-outlined text-primary text-[18px]">verified</span>
</div>
</div>
</div>
<!-- Floating Pill 2: Instant Settlement Tag -->
<div class="absolute -bottom-3 -right-2 sm:-right-6 z-20 bg-surface-container-lowest px-4 py-3 rounded-2xl shadow-[0_12px_28px_-6px_rgba(26,24,22,0.12)] flex items-center gap-3">
<div class="w-9 h-9 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary font-bold">
<span class="material-symbols-outlined text-[20px]">bolt</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface font-bold">Released in seconds</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">On Arc Mainnet</span>
</div>
</div>
<!-- Floating Pill 3: FX Pill -->
<div class="absolute top-1/2 -right-6 -translate-y-1/2 z-20 bg-surface-container-lowest px-3 py-2 rounded-xl shadow-md hidden sm:flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">1 USDC ≈ 1,335 NGN</span>
</div>
<!-- Decorative background coin ring -->
<div class="absolute inset-0 rounded-3xl border-2 border-dashed border-outline-variant/40 pointer-events-none"></div>
</div>
</div>
</div>
</section>
</div>
<!-- 2. SOCIAL PROOF & FEATURES STRIP -->
<section class="w-full bg-surface-container py-8 overflow-hidden relative">
<div class="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-6">
<div class="flex items-center gap-3 shrink-0">
<div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[22px]">all_inclusive</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm text-on-surface font-bold">$0 gas</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Recipients never pay to claim</p>
</div>
</div>
<!-- Feature Badges -->
<div class="flex flex-wrap items-center justify-center gap-3">
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">𝕏</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">Sign in with X</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">🔒</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">On-chain escrow</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">⚡</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">Instant settlement</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">↩️</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">30-day refunds</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">👛</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">No wallet needed</span>
</div>
</div>
</div>
</section>
<!-- 3. HOW IT WORKS (Three Step Journey Connected by Tumi) -->
<section class="w-full max-w-7xl mx-auto px-gutter-desktop py-24" id="how-it-works">
<div class="text-center max-w-2xl mx-auto mb-16">
<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-md text-label-md font-bold mb-4">
<span class="">SIMPLE BY DESIGN</span>
</div>
<h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-4">
        Three steps to send USDC to an 𝕏 handle
      </h2>
<p class="font-body-md text-body-md text-on-surface-variant">
        No wallet addresses to ask for, no bank details, no gas. Just a handle, an amount, and a link.
      </p>
</div>
<!-- 3 Bento Step Cards -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
<!-- Step 1 -->
<div class="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
<div class="w-12 h-12 rounded-2xl bg-secondary-fixed/40 flex items-center justify-center text-secondary font-headline-sm text-headline-sm font-bold mb-6">
          1
        </div>
<div class="mb-8">
<h3 class="font-headline-md text-headline-md text-on-surface mb-3">Enter their 𝕏 handle</h3>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Type the recipient's handle and an amount. Approve USDC and it drops straight into the <code class="bg-surface-container px-1.5 py-0.5 rounded text-primary">TumaEscrow</code> contract on Arc.
          </p>
</div>
<!-- Visual element for Step 1 -->
<div class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-2.5">
<div class="flex items-center gap-3 bg-surface-container-lowest p-2.5 rounded-lg shadow-sm">
<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">MK</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface font-bold">@mary_k</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">25.00 USDC • expires in 30 days</span>
</div>
<span class="material-symbols-outlined ml-auto text-primary text-[18px]">check_circle</span>
</div>
<div class="flex items-center gap-3 bg-surface-container-lowest/60 p-2.5 rounded-lg opacity-60">
<div class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-xs">OD</div>
<span class="font-label-sm text-label-sm text-on-surface">@obad_d</span>
</div>
</div>
</div>
<!-- Step 2 -->
<div class="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
<div class="w-12 h-12 rounded-2xl bg-primary-fixed/60 flex items-center justify-center text-primary font-headline-sm text-headline-sm font-bold mb-6">
          2
        </div>
<div class="mb-8">
<h3 class="font-headline-md text-headline-md text-on-surface mb-3">Share the claim link</h3>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Tuma hands you a claim link and a ready-made post for 𝕏. Send it however you like — the recipient doesn't need a wallet until the moment they claim.
          </p>
</div>
<!-- Visual element for Step 2 -->
<div class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
<div class="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg shadow-sm">
<span class="font-body-sm text-body-sm text-on-surface-variant">Claim link</span>
<span class="font-label-lg text-label-lg text-on-surface font-bold">/claim/42</span>
</div>
<div class="flex items-center justify-center gap-1 text-primary-container text-xs font-bold">
<span class="material-symbols-outlined text-[16px]">share</span>
<span class="">Shared on 𝕏, tagged @mary_k</span>
</div>
<div class="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg shadow-sm">
<span class="font-body-sm text-body-sm text-on-surface-variant">Status</span>
<span class="font-label-lg text-label-lg text-secondary font-extrabold">Open • escrowed</span>
</div>
</div>
</div>
<!-- Step 3 -->
<div class="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
<div class="w-12 h-12 rounded-2xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary font-headline-sm text-headline-sm font-bold mb-6">
          3
        </div>
<div class="mb-8">
<h3 class="font-headline-md text-headline-md text-on-surface mb-3">They claim with one login</h3>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            They sign in with 𝕏, paste a wallet address, and the operator releases the USDC to them. We verify the handle and pay the gas.
          </p>
</div>
<!-- Visual element for Step 3 -->
<div class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
<div class="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_4px_0_#b52603]">
<span class="material-symbols-outlined text-[24px]">send</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface font-bold mt-1">Released in seconds</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">ArcScan Tx: 0x9f2c…18ac</span>
</div>
</div>
</div>
<!-- Connected Mascot Horizontal Strip -->
<div class="mt-14 w-full bg-surface-container-low rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
<div class="flex items-center gap-5">
<img alt="Tumi the mascot in three poses: checking live rates, holding a USDC coin, and flying with a claim link" class="h-20 w-auto object-contain" src="/images/tumi-poses.jpg">
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Meet Tumi, your transfer companion</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant max-w-lg">
            Tumi watches live FX rates, keeps every payment locked in escrow, and celebrates the moment your funds land.
          </p>
</div>
</div>
<a class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors" href="/send">
<span class="">Send USDC</span>
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</a>
</div>
</section>
<!-- 4. FLOATING PRODUCT PREVIEW (The Tuma App in Action) -->
<section class="w-full bg-gradient-to-b from-surface to-surface-container-low py-24 relative overflow-hidden" id="product">
<div class="max-w-7xl mx-auto px-gutter-desktop">
<div class="text-center max-w-2xl mx-auto mb-16">
<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold mb-4">
<span class="">THE TUMA EXPERIENCE</span>
</div>
<h2 class="font-display-hero text-display-hero text-on-surface tracking-tight leading-tight">
          Your wallet, your payments,<br>live rates.
        </h2>
<p class="font-body-lg text-body-lg text-on-surface-variant mt-4">
          Connect a wallet, send to an 𝕏 handle, and track every payment — with live FX for the currencies that matter to you.
        </p>
</div>
<!-- Realistic Mockup Container -->
<div class="w-full max-w-5xl mx-auto bg-surface-container-lowest rounded-3xl shadow-2xl p-4 sm:p-8 relative">
<!-- App Top Bar Inside Mockup -->
<div class="flex items-center justify-between pb-6 mb-6 border-b border-surface-container">
<div class="flex items-center gap-3">
<div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold text-sm">
<span class="material-symbols-outlined text-[20px]">currency_exchange</span>
</div>
<div>
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">Tuma</span>
<span class="ml-2 font-label-sm text-label-sm text-primary-container bg-primary-fixed/40 px-2 py-0.5 rounded-full font-bold">Escrow-protected</span>
</div>
</div>
<!-- Profile Tag -->
<div class="flex items-center gap-3">
<div class="text-right hidden sm:block">
<span class="font-label-md text-label-md text-on-surface font-bold block">@yourhandle</span>
<span class="font-body-sm text-body-sm text-secondary font-medium flex items-center justify-end gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Verified via 𝕏
              </span>
</div>
<img alt="Your Tuma profile" class="w-10 h-10 rounded-full object-cover shadow-sm" src="/images/avatar.jpg">
</div>
</div>
<!-- App Body Layout -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
<!-- Left Column: Balance & Quick Transfer -->
<div class="lg:col-span-7 flex flex-col gap-6">
<!-- Wallet Card -->
<div class="bg-surface-container p-6 sm:p-8 rounded-2xl relative overflow-hidden">
<div class="flex items-center justify-between mb-4">
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Your wallet balance</span>
<span class="font-label-sm text-label-sm text-on-surface bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-sm font-semibold">USDC Wallet</span>
</div>
<div class="flex items-baseline gap-2 mb-6">
<span class="font-currency-display text-currency-display text-on-surface font-extrabold">25.00</span>
<span class="font-label-md text-label-md text-on-surface-variant font-bold">USDC</span>
</div>
<!-- Action Pills -->
<div class="grid grid-cols-3 gap-3">
<button class="flex items-center justify-center gap-2 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-[0_4px_0_#b52603] active:translate-y-0.5 active:shadow-[0_1px_0_#b52603] transition-all">
<span class="material-symbols-outlined text-[18px]">send</span>
<span class="">Send</span>
</button>
<button class="flex items-center justify-center gap-2 py-3 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors shadow-sm">
<span class="material-symbols-outlined text-[18px]">call_received</span>
<span class="">Request</span>
</button>
<button class="flex items-center justify-center gap-2 py-3 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors shadow-sm">
<span class="material-symbols-outlined text-[18px]">currency_exchange</span>
<span class="">Swap</span>
</button>
</div>
</div>
<!-- Quick Send Avatar Row -->
<div>
<div class="flex items-center justify-between mb-3">
<span class="font-label-md text-label-md text-on-surface font-bold">Quick send to</span>
<a class="font-body-sm text-body-sm text-primary hover:underline" href="/dashboard">Manage</a>
</div>
<div class="flex items-center gap-4 overflow-x-auto pb-2">
<!-- Add New Contact Button -->
<button class="flex flex-col items-center gap-1.5 shrink-0 group">
<div class="w-14 h-14 rounded-full border-2 border-dashed border-outline flex items-center justify-center text-outline group-hover:border-primary group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[24px]">add</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-medium">New</span>
</button>
<!-- Contact 1 -->
<button class="flex flex-col items-center gap-1.5 shrink-0">
<div class="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-lg ring-2 ring-primary-container">
                    MK
                  </div>
<span class="font-label-sm text-label-sm text-on-surface font-bold">@mary_k</span>
</button>
<!-- Contact 2 -->
<button class="flex flex-col items-center gap-1.5 shrink-0">
<div class="w-14 h-14 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-lg ring-2 ring-transparent hover:ring-secondary transition-all">
                    OD
                  </div>
<span class="font-label-sm text-label-sm text-on-surface font-bold">@obad_d</span>
</button>
<!-- Contact 3 -->
<button class="flex flex-col items-center gap-1.5 shrink-0">
<div class="w-14 h-14 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-lg ring-2 ring-transparent hover:ring-tertiary transition-all">
                    KM
                  </div>
<span class="font-label-sm text-label-sm text-on-surface font-bold">@khalid_m</span>
</button>
</div>
</div>
<!-- Recent Activity List -->
<div>
<span class="font-label-md text-label-md text-on-surface font-bold mb-3 block">Recent activity</span>
<div class="flex flex-col gap-2.5">
<div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[20px]">north_east</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface font-bold">Sent to @mary_k</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Today, 2:14 PM • Escrowed on Arc</p>
</div>
</div>
<div class="text-right">
<p class="font-label-lg text-label-lg text-on-surface font-bold">-25.00 USDC</p>
<p class="font-body-sm text-body-sm text-emerald-600 font-medium">Open</p>
</div>
</div>
<div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
<span class="material-symbols-outlined text-[20px]">check</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface font-bold">Claimed by @obad_d</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Yesterday • Released by operator</p>
</div>
</div>
<div class="text-right">
<p class="font-label-lg text-label-lg text-on-surface font-bold">-10.00 USDC</p>
<p class="font-body-sm text-body-sm text-emerald-600 font-medium">Claimed</p>
</div>
</div>
</div>
</div>
</div>
<!-- Right Column: Live FX Hub -->
<div class="lg:col-span-5 bg-surface-container p-6 rounded-2xl flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-4">
<span class="font-label-md text-label-md text-on-surface font-bold">Live FX</span>
<span class="inline-flex items-center gap-1 text-xs text-primary font-bold">
<span class="material-symbols-outlined text-[14px]">lock</span>
                  Live rate
                </span>
</div>
<!-- Input Row 1 -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm mb-3">
<span class="font-label-sm text-label-sm text-on-surface-variant block mb-1">You Send</span>
<div class="flex items-center justify-between">
<input class="font-headline-lg text-headline-lg font-extrabold text-on-surface bg-transparent focus:outline-none w-3/5" type="text" value="25.00" readonly>
<div class="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full font-label-md text-label-md font-bold text-on-surface">
<span class="">💵 USDC</span>
</div>
</div>
</div>
<!-- Breakdown Ledger -->
<div class="py-2 px-2 flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
<div class="flex justify-between">
<span class="">Transfer fee</span>
<span class="text-emerald-700 font-bold">$0.00 (No hidden fees)</span>
</div>
<div class="flex justify-between">
<span class="">Live rate</span>
<span class="text-on-surface font-medium">1 USDC = 1,335.69 NGN</span>
</div>
<div class="flex justify-between">
<span class="">Settlement speed</span>
<span class="text-primary font-medium">Instant (&lt; 10 seconds)</span>
</div>
</div>
<!-- Input Row 2 -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm mt-3 mb-6">
<span class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Recipient Gets</span>
<div class="flex items-center justify-between">
<input class="font-headline-lg text-headline-lg font-extrabold text-primary bg-transparent focus:outline-none w-3/5" readonly type="text" value="33,392.25">
<div class="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full font-label-md text-label-md font-bold text-on-surface">
<span class="">🇳🇬 NGN</span>
</div>
</div>
</div>
</div>
<!-- Confirm Button inside calculator -->
<a href="/send" class="w-full py-4 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-[0_4px_0_#b52603] active:translate-y-1 active:shadow-[0_1px_0_#b52603] transition-all flex items-center justify-center gap-2">
<span class="">Send 25.00 USDC</span>
<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</a>
</div>
</div>
</div>
</div>
</section>
<!-- 5. PERSONALITY & HUMAN STORYTELLING SECTION -->
<section class="w-full max-w-7xl mx-auto px-gutter-desktop py-24">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
<!-- Left: Mascot Celebration Art -->
<div class="lg:col-span-5 flex flex-col items-center text-center">
<div class="relative">
<div class="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-secondary-fixed-dim/30 absolute inset-0 filter blur-3xl -z-10"></div>
<img alt="Tumi the friendly mascot bird smiling warmly and waving hello" class="w-72 sm:w-88 h-auto object-contain mx-auto drop-shadow-xl hover:rotate-3 transition-transform duration-300" src="/images/tumi-waving.jpg">
</div>
<div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container shadow-sm">
<span class="material-symbols-outlined text-primary text-[18px]">favorite</span>
<span class="font-label-sm text-label-sm text-on-surface font-bold">Every payment has a person behind it</span>
</div>
</div>
<!-- Right: Stories & Values -->
<div class="lg:col-span-7 flex flex-col gap-8">
<div>
<span class="font-label-md text-label-md text-primary font-bold uppercase tracking-wider block mb-2">Our Promise</span>
<h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight leading-snug">
            "Your money has somewhere to go."
          </h2>
<p class="font-body-lg text-body-lg text-on-surface-variant mt-4 leading-relaxed">
            Behind every transfer is rent, tuition, a birthday gift, or support for someone you love. Tuma holds it in an on-chain escrow and turns the claim into a single login — no wallet apps, no seed phrases, no gas.
          </p>
</div>
<!-- 3 Testimonial Quote Cards -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
<div class="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
<p class="font-body-sm text-body-sm text-on-surface italic mb-4">
              "Sent my sister USDC for rent in Lagos. She claimed it in under a minute — she'd never had a wallet before."
            </p>
<div>
<p class="font-label-sm text-label-sm text-on-surface font-bold">Tayo O.</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Toronto to Lagos</p>
</div>
</div>
<div class="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
<p class="font-body-sm text-body-sm text-on-surface italic mb-4">
              "I don't ask for bank details anymore. I just send to their @handle and share the link."
            </p>
<div>
<p class="font-label-sm text-label-sm text-on-surface font-bold">Amina D.</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Seattle to Nairobi</p>
</div>
</div>
<div class="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
<p class="font-body-sm text-body-sm text-on-surface italic mb-4">
              "We pay contributors straight to their 𝕏 handle. No spreadsheets of wallet addresses."
            </p>
<div>
<p class="font-label-sm text-label-sm text-on-surface font-bold">Kwame M.</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">London to Accra</p>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- 6. SECURITY & TRUST BENTO -->
<section class="w-full bg-surface-container py-24" id="security">
<div class="max-w-7xl mx-auto px-gutter-desktop">
<div class="text-center max-w-2xl mx-auto mb-16">
<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md font-bold mb-4">
<span class="">RADICAL ASSURANCE</span>
</div>
<h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Escrow on-chain. Claims verified by 𝕏.
        </h2>
<p class="font-body-md text-body-md text-on-surface-variant mt-2">
          Funds sit in the Tuma escrow contract on Arc until the right account claims them — and open payments can be refunded.
        </p>
</div>
<!-- Bento Grid for Security Specs -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<!-- Pillar 1 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
<span class="material-symbols-outlined text-[26px]">lock</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">Escrowed on-chain</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Payments are held by the TumaEscrow contract, not by us. Deposit and refund rules are enforced in code.
            </p>
</div>
</div>
<!-- Pillar 2 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary mb-4">
<span class="material-symbols-outlined text-[26px]">verified_user</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">𝕏-verified claims</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Only the X account the payment was addressed to can claim it. Nobody else gets the funds.
            </p>
</div>
</div>
<!-- Pillar 3 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-tertiary mb-4">
<span class="material-symbols-outlined text-[26px]">schedule</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">30-day refunds</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Still unclaimed after 30 days? The sender can refund it from Activity, trustlessly, without asking us.
            </p>
</div>
</div>
<!-- Pillar 4 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-emerald-600 mb-4">
<span class="material-symbols-outlined text-[26px]">currency_exchange</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">Built on Arc</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              USDC-native settlement on Arc, so recipients need no gas and no extra token to receive.
            </p>
</div>
</div>
</div>
</div>
</section>
<!-- 7. FINAL CALL-TO-ACTION (Conversion Banner) -->
<section class="max-w-7xl mx-auto px-gutter-desktop py-20 w-full">
<div class="relative w-full rounded-3xl bg-gradient-to-tr from-primary via-primary-container to-secondary-container p-8 sm:p-16 text-center text-on-primary overflow-hidden shadow-2xl">
<!-- Ambient Circle Highlights -->
<div class="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-surface-container-lowest/10 blur-2xl pointer-events-none"></div>
<div class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
<div class="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest/20 backdrop-blur-md font-label-md text-label-md font-bold mb-6">
<span class="w-2 h-2 rounded-full bg-on-primary animate-ping"></span>
<span class="">Start sending in 2 minutes</span>
</div>
<h2 class="font-display-hero text-display-hero font-extrabold tracking-tight mb-6">
          Ready to send money to an 𝕏 handle?
        </h2>
<p class="font-body-lg text-body-lg text-on-primary/90 max-w-xl mb-8 leading-relaxed">
          Connect a wallet, type a handle, and send USDC on Arc. They claim it with one login — escrowed until they do.
        </p>
<div class="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-lg hover:bg-surface-container transition-all active:scale-[0.98]" href="/send">
<span class="">Send USDC</span>
<span class="material-symbols-outlined text-[20px] text-primary">arrow_forward</span>
</a>
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-primary-fixed/20 text-on-primary hover:bg-primary-fixed/30 font-label-lg text-label-lg transition-all" href="/dashboard">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
<span class="">Open dashboard</span>
</a>
</div>
<p class="font-body-sm text-body-sm text-on-primary/80 mt-6">
          No wallet needed to claim • Refundable after 30 days • Built on Arc
        </p>
</div>
</div>
</section>
</div></main><footer class="w-full bg-surface-container-low mt-auto"><div class="max-w-7xl mx-auto px-gutter-desktop pt-space-xl pb-space-xl"><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-xl mb-space-xl"><div class="col-span-2"><div class="flex items-center gap-space-sm mb-space-md"><span class="font-headline-md text-headline-md text-on-surface tracking-tight">Tuma</span><span class="h-2 w-2 rounded-full bg-primary-container inline-block"></span></div><p class="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">Send USDC to any 𝕏 handle. Escrowed on-chain, claimed with one login, refundable after 30 days. Built on Arc.</p><div class="flex items-center gap-space-sm text-on-surface-variant"><a aria-label="Global Network" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high hover:text-on-surface transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">public</span></a><a aria-label="Support Hub" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high hover:text-on-surface transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">chat_bubble</span></a><a aria-label="Community Forum" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high hover:text-on-surface transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">group</span></a></div></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Product</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/send">Send USDC</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/dashboard">Dashboard</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/payments">Activity</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="/admin">Admin</a></li></ul></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">How it works</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">Send to a handle</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#how-it-works">Claim with 𝕏 login</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#security">Escrow &amp; refunds</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#product">Live rates</a></li></ul></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Resources</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="https://docs.arc.io" target="_blank" rel="noopener noreferrer">Arc docs</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="https://explorer.arc.io" target="_blank" rel="noopener noreferrer">Arc explorer</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer">Circle faucet</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#security">Trust model</a></li></ul></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Legal</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy Policy</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms of Service</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">AML Compliance</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#security">Consumer Disclosures</a></li></ul></div></div><div class="bg-surface-container rounded-lg p-space-md mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-primary text-[24px]">verified_user</span><p class="font-body-sm text-body-sm text-on-surface-variant"><strong class="text-on-surface font-label-sm text-label-sm">Escrow-backed:</strong> every payment is held by the TumaEscrow contract on Arc Mainnet until the addressed 𝕏 account claims it. Open payments are refundable by the sender after 30 days.</p></div><div class="flex items-center gap-space-sm shrink-0"><span class="inline-flex items-center px-space-sm py-space-xs rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Arc Mainnet</span><span class="inline-flex items-center px-space-sm py-space-xs rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">USDC-native</span></div></div><div class="flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><p class="font-body-sm text-body-sm">© 2025 Tuma. All rights reserved.</p><div class="flex items-center gap-space-md"><span class="font-body-sm text-body-sm flex items-center gap-space-xs"><span class="w-2 h-2 rounded-full bg-secondary-container inline-block"></span> Systems Operational</span></div></div></div></footer>`;

export function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-background font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed"
      dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
    />
  );
}
