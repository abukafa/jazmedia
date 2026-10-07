"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicProfile } from "@/lib/actions/user";
import PortfolioView from "@/components/profile/PortfolioView";

export default function StudentProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    getPublicProfile(userId, 'student').then((res) => {
      if (res.success && res.data) {
        setProfile(res.data.user);
        setTasks(res.data.tasks);
      }
      setLoading(false);
    });
  }, [userId]);

  return <PortfolioView loading={loading} profile={profile} tasks={tasks} />;
}
