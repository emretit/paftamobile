
import { ListTodo, Clock, CheckCircle2 } from "lucide-react";

export const PIPELINE_COLUMNS = [
  { id: "todo" as const, title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress" as const, title: "Devam Ediyor", icon: Clock },
  { id: "completed" as const, title: "Tamamlandı", icon: CheckCircle2 },
] as const;
