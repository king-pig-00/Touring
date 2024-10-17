export interface ToDoListItem {
  _id: string;
  date: string;
  time: string;
  status: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToDoListConfig {
  _id: string;
  date: string;
  fromTime: string;
  toTime: string;
  title: string;
  description: string;
  state: number;
  urgent: number;
}
