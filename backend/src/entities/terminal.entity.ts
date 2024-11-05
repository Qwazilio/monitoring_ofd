import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Card } from "./card.entity";

@Entity('terminal')
export class Terminal{
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true, nullable: false})
    uid_terminal: number

    @Column({nullable: true})
    organization: string

    @Column({nullable: false})
    name_terminal: string

    @Column({nullable: true})
    name_store: string

    @Column({nullable: true})
    comment: string

    @Column({nullable: true})
    address: string

    @OneToOne(() => Card)
    active_card: Card

    @OneToMany(() => Card, (card) => card.terminal)
    cards: Card[]

    @Column({nullable: true})
    end_date_sub: Date

}