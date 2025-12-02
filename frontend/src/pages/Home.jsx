
import AppLayout from "../components/layouts/AppLayout";

const Home = () => {
  return (
    <AppLayout>
      <div className="bg-background h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            Select a friend to chat
          </h2>
          <p className="text-sm text-muted-foreground/80">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
