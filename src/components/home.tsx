import DashboardLayout from "./layout/DashboardLayout";

function Home() {
  return (
    <DashboardLayout>
      {/* Children will be used as fallback content */}
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Welcome to SignVault</h2>
        <p className="text-muted-foreground">
          Use the navigation to explore your document vault
        </p>
      </div>
    </DashboardLayout>
  );
}

export default Home;
