import { UserEntity } from 'src/user/models/entity/user.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'blogs' })
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  body: string;

  @Column()
  slug: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @Column({ nullable: true })
  headerImage: string;

  @Column({ default: 0 })
  likes: number;

  @Column({ nullable: true })
  publishedDate: Date;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne((type) => UserEntity, (user) => user.blogs)
  author: UserEntity;
}
