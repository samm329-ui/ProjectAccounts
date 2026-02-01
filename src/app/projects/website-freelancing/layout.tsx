export default function ControlPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen text-foreground bg-[#07070B]"
      style={{
        backgroundImage:
          'url(https://www.transparenttextures.com/patterns/stardust.png), radial-gradient(circle at 20% 20%, rgba(107, 93, 249, 0.1), transparent 30%), radial-gradient(circle at 80% 70%, rgba(92, 231, 244, 0.1), transparent 30%)',
        backgroundBlendMode: 'overlay, normal',
      }}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
