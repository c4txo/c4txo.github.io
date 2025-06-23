import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-2xl">
        {/* Profile Picture */}
        <div className="flex flex-col items-center w-full">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#e75480] mb-4">
            <div className="w-full h-full scale-135 origin-center relative">
              <Image
                src="/index.jpg"
                alt="Profile picture of Cat (@cthlynn)"
                width={192}
                height={192}
                className="object-cover w-full h-full absolute top-0 left-0"
                style={{ left: '10px', objectPosition: 'center -5%' }}
                priority
              />
            </div>
          </div>
        </div>
        {/* Intro Section */}
        <section className="w-full mb-6">
          <h2 className="text-xl font-bold mb-2">Intro</h2>
          <p className="text-base leading-relaxed">
            My name is{" "}
            <span className="font-semibold">Cat/@cthlynn</span> (she/her). I do
            fashion and cosplay modeling, sharing my work through content
            creation. I’ve collaborated with brands on a variety of projects, both
            online and in person. I’m located in Southern California, and travel
            between LA and OC.
          </p>
        </section>
        {/* Measurements Section */}
        <section className="w-full mb-6">
          <h2 className="text-xl font-bold mb-2">Measurements</h2>
          <div className="flex flex-col gap-1 text-base">
            <div>
              <span className="text-pink-500 mr-2">❤︎</span>
              Height: 160 cm (5ft 3in)
            </div>
            <div>
              <span className="text-pink-500 mr-2">❤︎</span>
              B-W-H: 75-65-87 cm (29.5-25.6-34.3 inches)
            </div>
            <div>
              <span className="text-pink-500 mr-2">❤︎</span>
              Shoe: 23 cm (US 6 womens)
            </div>
          </div>
        </section>
        {/* Services Section */}
        <section className="w-full mb-6">
          <h2 className="text-xl font-bold mb-2">Services</h2>
          <div className="flex flex-col gap-1 text-base mb-2">
            <div>
              <span className="text-pink-500 mr-2">❤︎</span>
              Instagram Post/Story/Reel/Video Content
            </div>
            <div>
              <span className="text-pink-500 mr-2">❤︎</span>
              Special Guest Appearance (Guest/Model/Host/Other)
            </div>
          </div>
          {/* Contact Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Contact Me</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/cthlynn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-transform hover:scale-110"
              >
                <Image
                  src="/instagram-icon.svg"
                  alt="Instagram icon"
                  width={36}
                  height={36}
                />
              </a>
              <a
                href="mailto:cthlynn@gmail.com"
                aria-label="Email"
                className="transition-transform hover:scale-110"
              >
                <Image
                  src="/email-icon.svg"
                  alt="Email icon"
                  width={36}
                  height={36}
                />
              </a>
            </div>
          </div>
        </section>
      </main>
      {/* Footer Section */}
    </div>
  );
}
