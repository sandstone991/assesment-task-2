import { Post } from "../../posts/models/posts.model";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({ length: 60 })
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
