import NavBar from "../components/NavBar";

export default function ComingSoon() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <NavBar />
      <div className="h-14 sm:h-16" />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-2xl">
        <div className="flex flex-col items-center w-full">
          <div className="text-2xl text-pink-500 font-bold text-center mt-20">
            Coming soon! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
          </div>
        </div>
      </main>
      {/* Footer Section */}
    </div>
  );
}
