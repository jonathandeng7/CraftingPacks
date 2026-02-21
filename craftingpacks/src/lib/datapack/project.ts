export type ProjectState = {
  namespace: string;
  description: string;
  version: "1.20.1";
};

export const DEFAULT_PROJECT: ProjectState = {
  namespace: "example",
  description: "Crafted in the workbench",
  version: "1.20.1",
};
