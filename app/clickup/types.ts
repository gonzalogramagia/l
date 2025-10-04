export interface Task {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  priority: {
    priority: string;
    color: string;
  } | null;
  due_date: string | null;
  description: string;
  url: string;
  assignees: Array<{
    username: string;
    profilePicture?: string;
  }>;
}

export interface UserData {
  username: string;
  email: string;
  profilePicture?: string;
}

export interface WorkspaceData {
  name: string;
}

export interface ListData {
  id: string;
  name: string;
  folder_id: string | null;
  folder_name?: string;
  space_id?: string;
  space_name?: string;
}
