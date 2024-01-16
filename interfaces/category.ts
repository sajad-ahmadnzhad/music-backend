export interface BodyCategoryParent {
    title: string
    description: string
}

export interface BodyCategory extends BodyCategoryParent {
    parent: string
}