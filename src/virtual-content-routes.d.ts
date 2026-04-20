declare module "virtual:content-routes" {
  interface BlogMeta {
    slug: string
    title: string
    description: string
    date: string
    tags: string[]
  }

  interface ProjectMeta {
    slug: string
    title: string
    subtitle: string
    description: string
    date: string
    tags: string[]
    github: string
  }

  export const SITE_URL: string
  export const SITE_NAME: string
  export const SITE_DESCRIPTION: string
  export const blogRoutes: BlogMeta[]
  export const projectRoutes: ProjectMeta[]
}
