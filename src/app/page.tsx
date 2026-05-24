import type { Metadata } from "next";
import Image from "next/image";
import HomeMenu from "@/components/HomeMenu";

export const metadata: Metadata = {
  title: "ダンジョンデリバリー | トップページ",
  description: "ダンジョンデリバリーのトップページです。",
};

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,166,90,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(112,150,131,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_26%,transparent_74%,rgba(255,255,255,0.03)_100%)]" />
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
        <h1 className="w-full">
          <Image
            src="/title.png"
            alt="ダンジョンデリバリー"
            width={1200}
            height={520}
            priority
            className="mx-auto h-auto w-full max-w-5xl object-contain"
          />
        </h1>

        <HomeMenu />
      </section>
    </main>
  );
}
