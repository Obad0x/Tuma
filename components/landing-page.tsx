/**
 * Tuma marketing landing page.
 *
 * This is a static design export (pure HTML + Tailwind classes). It is rendered
 * verbatim with `dangerouslySetInnerHTML` because it contains no user input and
 * converting ~1000 lines of markup to JSX adds risk without benefit. Tailwind
 * still scans this file, so every class used below is generated.
 *
 * The global header/footer are intentionally not used here; the page ships its own.
 */
const LANDING_HTML = `<header class="fixed top-0 left-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(26,24,22,0.03)]"><div class="h-20 max-w-7xl mx-auto px-gutter-desktop flex items-center justify-between"><div class="flex items-center gap-space-xl"><a class="flex items-center gap-space-sm focus:outline-none" data-path="home" href="/"><img alt="Clean modern minimalist SVG logo for 'Tuma' peer-to-peer money transfer. Bold friendly lowercase wordmark 'tuma' in warm deep charcoal with a vibrant terracotta-orange rounded sunburst dot on the 'u' that evokes a coin and smile. Premium, joyful, financial tech branding.. Design context: - Primary color: #ff5a36
- Font: plusJakartaSans
- Mode: light
- Roundness: rounded-full
. The logo should be visually consistent with these brand tokens." class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1UjW-hIKHp4cglZ6Qxj78SZC32ep87HnSRcK2CAhLdEP0KHK6pGMRHSF4LKjkCC2B9AX4-1lKZWxz1vOm0oY3wmwoAXDLqAo6M8qVydDGc0hYw6BNTcFxuR1d5RncXvMeLUSv8YSaHPMczY9GbtIyikQlPt9gQ5RKnUXNqp4us-237BmepRAr1pu5nJZQxwnjytxinh8R0kuGoeQ_Mk37jThfIYsNfFRxub0KF1pXJlWooXIijBnmuzMfk"><span class="font-headline-md text-headline-md text-on-surface tracking-tight hidden sm:inline">ftuma</span></a><nav class="hidden lg:flex items-center gap-space-lg" data-active-classes="text-on-surface font-label-lg"><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" data-path="how-it-works" href="#how-it-works">How it works</a><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" data-path="product" href="#">Product</a><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" data-path="corridors" href="#">Corridors</a><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" data-path="security" href="#">Security</a><a class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors" data-path="company" href="#">Company</a></nav></div><div class="flex items-center gap-space-md"><a class="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface px-space-md py-space-sm rounded-full transition-colors" data-path="login" href="/dashboard">Log in</a><a class="inline-flex items-center justify-center font-label-lg text-label-lg text-on-primary bg-primary-container hover:bg-primary shadow-[0_4px_0_#b52603] active:translate-y-[2px] active:shadow-[0_2px_0_#b52603] px-space-lg py-space-sm rounded-full transition-all" data-path="signup" href="/dashboard">Get started</a><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header><main class="w-full pt-20 bg-background flex-1"><div class="flex flex-col w-full">
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
<span class="font-label-md text-label-md text-on-surface-variant font-semibold">Zero hidden fees • Instant settlement to M-Pesa, NGN &amp; USD</span>
</div>
<!-- Main Hero Display Headline -->
<h1 class="font-display-hero text-display-hero text-on-surface tracking-tight leading-[1.08] max-w-2xl">
            Money should <span class="text-primary-container relative inline-block">feel simple<svg class="absolute -bottom-2 left-0 w-full text-secondary-container h-2.5 pointer-events-none" fill="none" preserveAspectRatio="none" viewBox="0 0 160 12"><path d="M2 9.5C40 2 120 2 158 9.5" stroke="currentColor" stroke-linecap="round" stroke-width="4"></path></svg></span>.
          </h1>
<!-- Hero Subtitle -->
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
            Send money to your people without the unnecessary complexity. Radiant rates, instant delivery to mobile wallets or banks, and a companion who celebrates every transfer with you.
          </p>
<!-- CTAs -->
<div class="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_6px_0_#b52603] active:translate-y-1 active:shadow-[0_2px_0_#b52603] transition-all duration-150" data-path="signup" href="/dashboard">
<span class="">Get started free</span>
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
<img alt="Amina Diallo, verified sender on Tuma" class="inline-block h-10 w-10 rounded-full ring-2 ring-surface object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VbMg8hpxaAVqAwmA9tgrJSj9jlFRuUXSAz91kr72ujXBTwj001AxPEHGeP8KUN0bITPuIVCAt8Objp7Oas2rDyT4o1QRfktSct_59bUFnMt9UiMAAJkWMmjDMnVoWdERurnmYe0u29bUvMs_0OjZcHe0ie_Xus8tOxQtb_2KltBXTFKKDQFoHRuZdTEQBb61e2mYMM1_odOtwExKEM9r0EC-NkE2LQtMBYoH_n2lPMiQnd-4GPsybxcw">
<div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm ring-2 ring-surface font-bold">KM</div>
<div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm ring-2 ring-surface font-bold">FA</div>
<div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm ring-2 ring-surface font-bold">+140k</div>
</div>
<div class="flex flex-col">
<div class="flex items-center gap-1 text-secondary">
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">star</span>
<span class="font-label-sm text-label-sm text-on-surface font-bold ml-1">4.9 / 5</span>
</div>
<span class="font-body-sm text-body-sm text-on-surface-variant">Over 140,000 happy senders across 18 corridors</span>
</div>
</div>
</div>
<!-- Right Hero Interactive Visual Showcase -->
<div class="lg:col-span-5 relative flex items-center justify-center">
<!-- Outer Soft Halo -->
<div class="w-full max-w-md aspect-square bg-gradient-to-tr from-secondary-container/30 via-primary-container/20 to-tertiary-container/30 rounded-3xl p-6 relative flex items-center justify-center shadow-xl">
<!-- Center Tumi Mascot Visual -->
<div class="relative z-10 flex flex-col items-center">
<img alt="Tumi the friendly yellow mascot floating happily delivering a glowing gold coin to a friend" class="w-72 h-72 sm:w-84 sm:h-84 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChjSTZqlL_mJk2QFOJgtfU6DlLleV-tSqzhDy9AgFqc0PhbENfl8K8CY0zSk3ruw0O25nTxE2vCloA0Yg6o4xB3Pri86old-8hDRDvFIp2K87QHizA_9tGY0O-eFxdLA9eHAL0FlOShMpfYqcEU_Elv3KqDX-MW_XT3t_LPUyPeWMY80t2q7CkTCbkhoQV9AYYYPzK5oXSB42nk6QoeoMbrv3c1L0mo3sBjzwtOjN21lHdx7O1iFiu">
</div>
<!-- Floating Pill 1: Incoming Transfer Notification -->
<div class="absolute -top-4 -left-4 sm:-left-8 z-20 bg-surface-container-lowest p-3.5 pr-5 rounded-2xl shadow-[0_12px_28px_-6px_rgba(26,24,22,0.12)] flex items-center gap-3 animate-bounce" style="animation-duration: 4s;">
<img alt="Amina Diallo portrait" class="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VbMg8hpxaAVqAwmA9tgrJSj9jlFRuUXSAz91kr72ujXBTwj001AxPEHGeP8KUN0bITPuIVCAt8Objp7Oas2rDyT4o1QRfktSct_59bUFnMt9UiMAAJkWMmjDMnVoWdERurnmYe0u29bUvMs_0OjZcHe0ie_Xus8tOxQtb_2KltBXTFKKDQFoHRuZdTEQBb61e2mYMM1_odOtwExKEM9r0EC-NkE2LQtMBYoH_n2lPMiQnd-4GPsybxcw">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Received instantly</span>
<div class="flex items-center gap-1.5">
<span class="font-headline-sm text-headline-sm text-on-surface font-bold">+$250.00</span>
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
<span class="font-label-sm text-label-sm text-on-surface font-bold">Arrived in 4 seconds</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Direct to M-Pesa Safaricom</span>
</div>
</div>
<!-- Floating Pill 3: Guaranteed FX Pill -->
<div class="absolute top-1/2 -right-6 -translate-y-1/2 z-20 bg-surface-container-lowest px-3 py-2 rounded-xl shadow-md hidden sm:flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">1 USD = 128.40 KES</span>
</div>
<!-- Decorative background coin ring -->
<div class="absolute inset-0 rounded-3xl border-2 border-dashed border-outline-variant/40 pointer-events-none"></div>
</div>
</div>
</div>
</section>
</div>
<!-- 2. SOCIAL PROOF & CORRIDORS STRIP -->
<section class="w-full bg-surface-container py-8 overflow-hidden relative">
<div class="max-w-7xl mx-auto px-gutter-desktop flex flex-col md:flex-row items-center justify-between gap-6">
<div class="flex items-center gap-3 shrink-0">
<div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined text-[22px]">all_inclusive</span>
</div>
<div>
<p class="font-headline-sm text-headline-sm text-on-surface font-bold">$42.8M+</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Sent safely home this month</p>
</div>
</div>
<!-- Corridor Badges Horizontal Mosaic -->
<div class="flex flex-wrap items-center justify-center gap-3">
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">🇰🇪</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">Kenya (M-Pesa)</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">🇳🇬</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">Nigeria (All Banks / PayWithTransfer)</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">🇬🇭</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">Ghana (MTN &amp; Telecel)</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">🇺🇸</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">United States (FedNow/ACH)</span>
</div>
<div class="inline-flex items-center gap-2 bg-surface px-3.5 py-2 rounded-full shadow-sm">
<span class="text-[16px]">🇬🇧</span>
<span class="font-label-sm text-label-sm text-on-surface font-semibold">UK &amp; Europe (Faster Payments)</span>
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
        Three effortless steps from your pocket to theirs
      </h2>
<p class="font-body-md text-body-md text-on-surface-variant">
        No bank queues, no mysterious exchange margins, no delayed wire clearing. Just tap, convert, and smile.
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
<h3 class="font-headline-md text-headline-md text-on-surface mb-3">Find your person</h3>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Search by phone number, their bespoke <code class="bg-surface-container px-1.5 py-0.5 rounded text-primary">@tumatag</code>, or bank account. Tuma saves previous recipients for one-tap repeat transfers.
          </p>
</div>
<!-- Visual element for Step 1 -->
<div class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-2.5">
<div class="flex items-center gap-3 bg-surface-container-lowest p-2.5 rounded-lg shadow-sm">
<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">AD</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface font-bold">Amina Diallo</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">@amina • +254 712 ••• 491</span>
</div>
<span class="material-symbols-outlined ml-auto text-primary text-[18px]">check_circle</span>
</div>
<div class="flex items-center gap-3 bg-surface-container-lowest/60 p-2.5 rounded-lg opacity-60">
<div class="w-8 h-8 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-xs">KM</div>
<span class="font-label-sm text-label-sm text-on-surface">Kwame Mensah (@kwame)</span>
</div>
</div>
</div>
<!-- Step 2 -->
<div class="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
<div class="w-12 h-12 rounded-2xl bg-primary-fixed/60 flex items-center justify-center text-primary font-headline-sm text-headline-sm font-bold mb-6">
          2
        </div>
<div class="mb-8">
<h3 class="font-headline-md text-headline-md text-on-surface mb-3">Choose the amount</h3>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Lock in a transparent, real-time exchange rate. No markups, no hidden commissions, and 100% clarity before you confirm a single cent.
          </p>
</div>
<!-- Visual element for Step 2 -->
<div class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
<div class="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg shadow-sm">
<span class="font-body-sm text-body-sm text-on-surface-variant">You send</span>
<span class="font-label-lg text-label-lg text-on-surface font-bold">$500.00 USD</span>
</div>
<div class="flex items-center justify-center gap-1 text-primary-container text-xs font-bold">
<span class="material-symbols-outlined text-[16px]">swap_vert</span>
<span class="">Mid-market rate: 128.40 KES</span>
</div>
<div class="flex justify-between items-center bg-surface-container-lowest p-3 rounded-lg shadow-sm">
<span class="font-body-sm text-body-sm text-on-surface-variant">They receive</span>
<span class="font-label-lg text-label-lg text-primary font-extrabold">64,200.00 KES</span>
</div>
</div>
</div>
<!-- Step 3 -->
<div class="group bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
<div class="w-12 h-12 rounded-2xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary font-headline-sm text-headline-sm font-bold mb-6">
          3
        </div>
<div class="mb-8">
<h3 class="font-headline-md text-headline-md text-on-surface mb-3">Send it with joy</h3>
<p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            One biometric tap and your money flies instantly. Tumi delivers confirmation right to both phones with instant settlement receipts.
          </p>
</div>
<!-- Visual element for Step 3 -->
<div class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2">
<div class="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_4px_0_#b52603]">
<span class="material-symbols-outlined text-[24px]">send</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface font-bold mt-1">Delivered in 4.2 seconds</span>
<span class="font-body-sm text-body-sm text-on-surface-variant">Safaricom Reference: TUMA-98218-OK</span>
</div>
</div>
</div>
<!-- Connected Mascot Horizontal Strip -->
<div class="mt-14 w-full bg-surface-container-low rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
<div class="flex items-center gap-5">
<img alt="Tumi the mascot in three poses: inspecting rates, holding a 100 dollar sign, and flying with an envelope" class="h-20 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjHVvinwnZ-G9FRPmKbZxOBm_4Vvsl5rLnxdfncfgm3v-PkL6f7gHQBT7eziRgU1f-giJ5WdbTxaydNwUEeku1vkcKuhvn59jahxgCsCLz1vjV5zfHKnfxWo_HUQn0zC_sb8qMixhIndyT-C4O7llL4yq3ZV_-glYNApEGbxjKyqUwdQKQmIEuESCOr35USIGNZAJbUgQUtKHUVR44iArIExcuOTJExwMLpgiwxfP0IgcHqAB4Lez8">
<div>
<h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">Meet Tumi, your transfer companion</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant max-w-lg">
            Tumi keeps watch over FX rates, verifies bank credentials, and celebrates with confetti whenever your funds land safely.
          </p>
</div>
</div>
<a class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors" data-path="signup" href="/dashboard">
<span class="">Try a test transfer</span>
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</a>
</div>
</section>
<!-- 4. FLOATING PRODUCT PREVIEW (The Tuma App in Action) -->
<section class="w-full bg-gradient-to-b from-surface to-surface-container-low py-24 relative overflow-hidden">
<div class="max-w-7xl mx-auto px-gutter-desktop">
<div class="text-center max-w-2xl mx-auto mb-16">
<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-label-md font-bold mb-4">
<span class="">THE TUMA EXPERIENCE</span>
</div>
<h2 class="font-display-hero text-display-hero text-on-surface tracking-tight leading-tight">
          Designed to delight.<br>Engineered for precision.
        </h2>
<p class="font-body-lg text-body-lg text-on-surface-variant mt-4">
          A financial cockpit that turns complex cross-border currency rails into an effortless, uplifting everyday routine.
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
<span class="font-headline-sm text-headline-sm text-on-surface font-extrabold tracking-tight">tuma</span>
<span class="ml-2 font-label-sm text-label-sm text-primary-container bg-primary-fixed/40 px-2 py-0.5 rounded-full font-bold">Personal Account</span>
</div>
</div>
<!-- Amina Profile Tag -->
<div class="flex items-center gap-3">
<div class="text-right hidden sm:block">
<span class="font-label-md text-label-md text-on-surface font-bold block">Amina Diallo</span>
<span class="font-body-sm text-body-sm text-secondary font-medium flex items-center justify-end gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Tier-2 Verified
              </span>
</div>
<img alt="Amina Diallo profile photo" class="w-10 h-10 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida/AEtjO1VbMg8hpxaAVqAwmA9tgrJSj9jlFRuUXSAz91kr72ujXBTwj001AxPEHGeP8KUN0bITPuIVCAt8Objp7Oas2rDyT4o1QRfktSct_59bUFnMt9UiMAAJkWMmjDMnVoWdERurnmYe0u29bUvMs_0OjZcHe0ie_Xus8tOxQtb_2KltBXTFKKDQFoHRuZdTEQBb61e2mYMM1_odOtwExKEM9r0EC-NkE2LQtMBYoH_n2lPMiQnd-4GPsybxcw">
</div>
</div>
<!-- App Body Layout -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
<!-- Left Column: Balance & Quick Transfer -->
<div class="lg:col-span-7 flex flex-col gap-6">
<!-- Wallet Card with Terracotta Accents -->
<div class="bg-surface-container p-6 sm:p-8 rounded-2xl relative overflow-hidden">
<div class="flex items-center justify-between mb-4">
<span class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Total Available Balance</span>
<span class="font-label-sm text-label-sm text-on-surface bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-sm font-semibold">USD Account</span>
</div>
<div class="flex items-baseline gap-2 mb-6">
<span class="font-currency-display text-currency-display text-on-surface font-extrabold">$8,420.50</span>
<span class="font-label-md text-label-md text-on-surface-variant font-bold">USD</span>
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
<span class="material-symbols-outlined text-[18px]">add_circle</span>
<span class="">Top-up</span>
</button>
</div>
</div>
<!-- Quick Send Avatar Row -->
<div>
<div class="flex items-center justify-between mb-3">
<span class="font-label-md text-label-md text-on-surface font-bold">Quick Send Favorites</span>
<a class="font-body-sm text-body-sm text-primary hover:underline" href="#">Manage</a>
</div>
<div class="flex items-center gap-4 overflow-x-auto pb-2">
<!-- Add New Contact Button -->
<button class="flex flex-col items-center gap-1.5 shrink-0 group">
<div class="w-14 h-14 rounded-full border-2 border-dashed border-outline flex items-center justify-center text-outline group-hover:border-primary group-hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[24px]">add</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Add New</span>
</button>
<!-- Contact 1 -->
<button class="flex flex-col items-center gap-1.5 shrink-0">
<img alt="Mama Diallo" class="w-14 h-14 rounded-full object-cover ring-2 ring-primary-container" src="https://lh3.googleusercontent.com/aida/AEtjO1VbMg8hpxaAVqAwmA9tgrJSj9jlFRuUXSAz91kr72ujXBTwj001AxPEHGeP8KUN0bITPuIVCAt8Objp7Oas2rDyT4o1QRfktSct_59bUFnMt9UiMAAJkWMmjDMnVoWdERurnmYe0u29bUvMs_0OjZcHe0ie_Xus8tOxQtb_2KltBXTFKKDQFoHRuZdTEQBb61e2mYMM1_odOtwExKEM9r0EC-NkE2LQtMBYoH_n2lPMiQnd-4GPsybxcw">
<span class="font-label-sm text-label-sm text-on-surface font-bold">Mama</span>
</button>
<!-- Contact 2 -->
<button class="flex flex-col items-center gap-1.5 shrink-0">
<div class="w-14 h-14 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-lg ring-2 ring-transparent hover:ring-secondary transition-all">
                    KM
                  </div>
<span class="font-label-sm text-label-sm text-on-surface font-bold">Kwame</span>
</button>
<!-- Contact 3 -->
<button class="flex flex-col items-center gap-1.5 shrink-0">
<div class="w-14 h-14 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-lg ring-2 ring-transparent hover:ring-tertiary transition-all">
                    JO
                  </div>
<span class="font-label-sm text-label-sm text-on-surface font-bold">Jemila</span>
</button>
<!-- Contact 4 -->
<button class="flex flex-col items-center gap-1.5 shrink-0">
<div class="w-14 h-14 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-lg">
                    ST
                  </div>
<span class="font-label-sm text-label-sm text-on-surface font-bold">Studio</span>
</button>
</div>
</div>
<!-- Recent Activity List -->
<div>
<span class="font-label-md text-label-md text-on-surface font-bold mb-3 block">Recent Ledger Activity</span>
<div class="flex flex-col gap-2.5">
<div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[20px]">north_east</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface font-bold">Sent to Mama Diallo (M-Pesa)</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Today, 2:14 PM • Direct Wallet Settlement</p>
</div>
</div>
<div class="text-right">
<p class="font-label-lg text-label-lg text-on-surface font-bold">-$250.00</p>
<p class="font-body-sm text-body-sm text-emerald-600 font-medium">Completed</p>
</div>
</div>
<div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
<span class="material-symbols-outlined text-[20px]">north_east</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface font-bold">Kwame Mensah (Ghana MoMo)</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Yesterday • Tuition Share</p>
</div>
</div>
<div class="text-right">
<p class="font-label-lg text-label-lg text-on-surface font-bold">-$120.00</p>
<p class="font-body-sm text-body-sm text-emerald-600 font-medium">Completed</p>
</div>
</div>
</div>
</div>
</div>
<!-- Right Column: Interactive Send Calculator Hub -->
<div class="lg:col-span-5 bg-surface-container p-6 rounded-2xl flex flex-col justify-between">
<div>
<div class="flex items-center justify-between mb-4">
<span class="font-label-md text-label-md text-on-surface font-bold">Instant Calculator</span>
<span class="inline-flex items-center gap-1 text-xs text-primary font-bold">
<span class="material-symbols-outlined text-[14px]">lock</span>
                  Locked 10 mins
                </span>
</div>
<!-- Input Row 1 -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm mb-3">
<span class="font-label-sm text-label-sm text-on-surface-variant block mb-1">You Send Exactly</span>
<div class="flex items-center justify-between">
<input class="font-headline-lg text-headline-lg font-extrabold text-on-surface bg-transparent focus:outline-none w-3/5" type="text" value="500.00">
<div class="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full font-label-md text-label-md font-bold text-on-surface">
<span class="">🇺🇸 USD</span>
<span class="material-symbols-outlined text-[16px]">expand_more</span>
</div>
</div>
</div>
<!-- Breakdown Ledger -->
<div class="py-2 px-2 flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
<div class="flex justify-between">
<span class="">Transfer fee</span>
<span class="text-emerald-700 font-bold">$0.00 (Transparent zero fee)</span>
</div>
<div class="flex justify-between">
<span class="">Guaranteed FX Rate</span>
<span class="text-on-surface font-medium">1 USD = 128.40 KES</span>
</div>
<div class="flex justify-between">
<span class="">Settlement Speed</span>
<span class="text-primary font-medium">Instant (&lt; 10 seconds)</span>
</div>
</div>
<!-- Input Row 2 -->
<div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm mt-3 mb-6">
<span class="font-label-sm text-label-sm text-on-surface-variant block mb-1">Recipient Gets</span>
<div class="flex items-center justify-between">
<input class="font-headline-lg text-headline-lg font-extrabold text-primary bg-transparent focus:outline-none w-3/5" readonly="" type="text" value="64,200.00">
<div class="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full font-label-md text-label-md font-bold text-on-surface">
<span class="">🇰🇪 KES</span>
<span class="material-symbols-outlined text-[16px]">expand_more</span>
</div>
</div>
</div>
</div>
<!-- Confirm Button inside calculator -->
<button class="w-full py-4 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-[0_4px_0_#b52603] active:translate-y-1 active:shadow-[0_1px_0_#b52603] transition-all flex items-center justify-center gap-2">
<span class="">Continue with $500.00</span>
<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
</button>
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
<img alt="Tumi the friendly mascot bird smiling warmly and waving hello with joyful eyes" class="w-72 sm:w-88 h-auto object-contain mx-auto drop-shadow-xl hover:rotate-3 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida/AEtjO1U3YQh5ndXkf4Wj1tPP45eaRpfGGi349UfItqd0mVCUwmYhDfDydveF-_iU0ZcbT3vSyaW6UYeohqPtYZ7bPzQw6k7DI5nTfEY4cs71JWZfLtk4drQQ4AG1A-p3LYbwuXYPb-mKOtEJFZ7oXejsdtcEXWQE-mYGADWe3P9uFR2Dm5snoYUSYP41cavc8AaDrSSNyBWK1L9o_HqTYQ6dnuwaf1VgIWmU_QzNz-rFXayAw0fGdcwIEOpP46k">
</div>
<div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container shadow-sm">
<span class="material-symbols-outlined text-primary text-[18px]">favorite</span>
<span class="font-label-sm text-label-sm text-on-surface font-bold">Every transfer carries someone's love</span>
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
            Behind every transaction is a sibling's school semester, a mother's pharmacy prescription, a celebration gift, or emergency support. We treat your transfers with the emotional weight and technological velocity they deserve.
          </p>
</div>
<!-- 3 Testimonial Quote Cards -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
<div class="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
<p class="font-body-sm text-body-sm text-on-surface italic mb-4">
              "For Mama's birthday in Nairobi — it arrived in her M-Pesa before I even finished dialing her on FaceTime."
            </p>
<div>
<p class="font-label-sm text-label-sm text-on-surface font-bold">Amina D.</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Seattle to Nairobi</p>
</div>
</div>
<div class="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
<p class="font-body-sm text-body-sm text-on-surface italic mb-4">
              "Splitting university tuition across borders without bank delays or predatory 6% wire surcharges."
            </p>
<div>
<p class="font-label-sm text-label-sm text-on-surface font-bold">Kwame M.</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">London to Accra</p>
</div>
</div>
<div class="bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between">
<p class="font-body-sm text-body-sm text-on-surface italic mb-4">
              "Supporting my animation studio team in Lagos with guaranteed next-minute payouts. Essential."
            </p>
<div>
<p class="font-label-sm text-label-sm text-on-surface font-bold">Tayo O.</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Toronto to Lagos</p>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- 6. SECURITY & TRUST BENTO -->
<section class="w-full bg-surface-container py-24">
<div class="max-w-7xl mx-auto px-gutter-desktop">
<div class="text-center max-w-2xl mx-auto mb-16">
<div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-highest text-on-surface font-label-md text-label-md font-bold mb-4">
<span class="">RADICAL ASSURANCE</span>
</div>
<h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Bank-grade velocity. Zero compromise.
        </h2>
<p class="font-body-md text-body-md text-on-surface-variant mt-2">
          Your hard-earned money travels through encrypted, audited pipelines compliant with premier global regulatory bodies.
        </p>
</div>
<!-- Bento Grid for Security Specs -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<!-- Pillar 1 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-4">
<span class="material-symbols-outlined text-[26px]">enhanced_encryption</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">256-bit AES</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Every token, message, and payload is guarded by end-to-end cryptographic cipher tunnels.
            </p>
</div>
</div>
<!-- Pillar 2 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary mb-4">
<span class="material-symbols-outlined text-[26px]">account_balance</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">Segregated Funds</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Customer balances are ring-fenced at Tier-1 regulated custodian partner banks. Never lent.
            </p>
</div>
</div>
<!-- Pillar 3 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-tertiary mb-4">
<span class="material-symbols-outlined text-[26px]">fingerprint</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">Biometric Shield</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              FaceID, fingerprint tokens, and instant 2FA hardware keys required for any outbound transfer.
            </p>
</div>
</div>
<!-- Pillar 4 -->
<div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm flex flex-col justify-between">
<div class="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-emerald-600 mb-4">
<span class="material-symbols-outlined text-[26px]">verified</span>
</div>
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-bold">Regulated &amp; Audited</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">
              Fully registered Money Services Business compliant with FinCEN, FCA, and central bank regulations.
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
          Ready to send money home with joy?
        </h2>
<p class="font-body-lg text-body-lg text-on-primary/90 max-w-xl mb-8 leading-relaxed">
          Join 140,000+ diaspora families and global creators. No monthly account fees, transparent real-time FX, and instant settlement.
        </p>
<div class="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-lg hover:bg-surface-container transition-all active:scale-[0.98]" data-path="signup" href="/dashboard">
<span class="">Create your free account</span>
<span class="material-symbols-outlined text-[20px] text-primary">arrow_forward</span>
</a>
<a class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-primary-fixed/20 text-on-primary hover:bg-primary-fixed/30 font-label-lg text-label-lg transition-all" data-path="how-it-works" href="/dashboard">
<span class="material-symbols-outlined text-[20px]">download</span>
<span class="">Download App</span>
</a>
</div>
<p class="font-body-sm text-body-sm text-on-primary/80 mt-6">
          No credit card required • Zero maintenance charges • Instant KYC verification
        </p>
</div>
</div>
</section>
</div></main><footer class="w-full bg-surface-container-low mt-auto"><div class="max-w-7xl mx-auto px-gutter-desktop pt-space-xl pb-space-xl"><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-xl mb-space-xl"><div class="col-span-2"><div class="flex items-center gap-space-sm mb-space-md"><span class="font-headline-md text-headline-md text-on-surface tracking-tight">tuma</span><span class="h-2 w-2 rounded-full bg-primary-container inline-block"></span></div><p class="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-lg">Character-driven peer-to-peer velocity. Send money home with warmth, radical transparency, and instant cross-border settlement across the continent.</p><div class="flex items-center gap-space-sm text-on-surface-variant"><a aria-label="Global Network" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high hover:text-on-surface transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">public</span></a><a aria-label="Support Hub" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high hover:text-on-surface transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">chat_bubble</span></a><a aria-label="Community Forum" class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high hover:text-on-surface transition-colors" href="#"><span class="material-symbols-outlined text-[20px]">group</span></a></div></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Product</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="product" href="#">Instant Send</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="product" href="#">Tuma Pots</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="product" href="#">Virtual Tag</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="how-it-works" href="#">Companion Tumi</a></li></ul></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Corridors</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="corridors" href="#">Kenya (KES)</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="corridors" href="#">Nigeria (NGN)</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="corridors" href="#">Ghana (GHS)</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="corridors" href="#">UK &amp; Eurozone</a></li></ul></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Company</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="company" href="#">About Us</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="company" href="#">Careers</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="company" href="#">Press Kit</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="security" href="#">Security Standards</a></li></ul></div><div><h3 class="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Legal</h3><ul class="flex flex-col gap-space-sm"><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="legal-privacy" href="#">Privacy Policy</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="legal-terms" href="#">Terms of Service</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="legal-compliance" href="#">AML Compliance</a></li><li role="none" class=""><a class="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" data-path="security" href="#">Consumer Disclosures</a></li></ul></div></div><div class="bg-surface-container rounded-lg p-space-md mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-primary text-[24px]">verified_user</span><p class="font-body-sm text-body-sm text-on-surface-variant"><strong class="text-on-surface font-label-sm text-label-sm">Bank-Grade Assurance:</strong> Tuma is licensed and regulated by financial regulatory authorities across active operating jurisdictions. Client funds are maintained in segregated tier-1 custodian partner accounts.</p></div><div class="flex items-center gap-space-sm shrink-0"><span class="inline-flex items-center px-space-sm py-space-xs rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">256-bit TLS</span><span class="inline-flex items-center px-space-sm py-space-xs rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">PCI-DSS Level 1</span></div></div><div class="flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant"><p class="font-body-sm text-body-sm">© 2025 Tuma Technologies Inc. All rights reserved.</p><div class="flex items-center gap-space-md"><span class="font-body-sm text-body-sm flex items-center gap-space-xs"><span class="w-2 h-2 rounded-full bg-secondary-container inline-block"></span> Systems Operational</span></div></div></div></footer>`;

export function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-background font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed"
      dangerouslySetInnerHTML={{ __html: LANDING_HTML }}
    />
  );
}
