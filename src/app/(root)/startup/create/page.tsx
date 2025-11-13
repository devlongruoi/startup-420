import { redirect } from "next/navigation";
import { auth } from "@/auth";
import StartupForm from "@/components/StartupForm";

const Page = async () => {
  try {
    const session = await auth();
 
    if (!session) {
      redirect("/");
    }
 
    return (
      <>
        <section className="pink_container !min-h-[230px]">
          <h1 className="heading">Submit Your Startup</h1>
        </section>
        
        <StartupForm />
      </>
    );
  } catch (error) {
    console.error('Authentication error:', error);
    redirect("/");
  }

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading">Submit Your Startup</h1>
      </section>

      <StartupForm />
    </>
  );
};

export default Page;