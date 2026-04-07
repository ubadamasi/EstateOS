export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-[#0f2d5c] rounded-lg flex items-center justify-center text-white font-extrabold text-[16px]">
            EO
          </div>
          <span className="text-[20px] font-bold text-[#0f2d5c]">EstateOS</span>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-8 text-center shadow-sm">
          <div className="text-[40px] mb-4">📬</div>
          <h1 className="text-[18px] font-bold text-[#0f172a] mb-2">
            Check your email
          </h1>
          <p className="text-[14px] text-[#64748b]">
            A sign-in link has been sent to your email address. Click it to
            sign in — it expires in 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
