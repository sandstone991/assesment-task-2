import { Users as User } from '../../users/models/users.model';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Tree,
  TreeChildren,
  TreeParent,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
 
} from 'typeorm';

@Entity()
@Tree('closure-table')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;
  // root nodes have null operation
  @Column({
    nullable: true,
  })
  operation: '+' | '-' | '*' | '/';

  @TreeChildren()
  children: Post[];
  
  @TreeParent({ onDelete: 'CASCADE' })
  parent: Post;



  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
