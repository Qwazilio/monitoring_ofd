import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from 'src/entities/card.entity';
import { Terminal } from 'src/entities/terminal.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class TerminalService {
    constructor(
        @InjectRepository(Terminal)
        private terminalRepository: Repository<Terminal>
    ){}

    async getAll() : Promise<Terminal[]>{
        const terminals = await this.terminalRepository.find({
            relations: ['active_card', 'cards']
        });
        if(!terminals) throw new NotFoundException('Terminals not found!')
        return terminals;
    }

    async getOne({terminal_id} : {terminal_id: number}) : Promise<Terminal>{
        const terminal = await this.terminalRepository.findOne({
            where: {id: terminal_id},
            relations: ['active_card']
        })
        if(!terminal) throw new NotFoundException('Terminal not found!')
        return terminal;
    }

    async getOneByUid({uid_terminal} : {uid_terminal: string}) : Promise<Terminal>{
        const terminal = await this.terminalRepository.findOne({
            where: {uid_terminal: uid_terminal},
            relations: ['active_card']
        })
        if(!terminal) throw new NotFoundException('Terminal not found!')
        return terminal;
    }

    async add(terminal: Partial<Terminal>) : Promise<Terminal> {
        const terminal_old = await this.terminalRepository.findOne({where:{uid_terminal: terminal.uid_terminal}})
        if(terminal_old) throw new ConflictException(`Terminal with UID:${terminal.uid_terminal} already exists`)
        const terminal_new = this.terminalRepository.create(
            terminal
        )        
        return await this.terminalRepository.save(terminal_new)
    }

    async update(terminal_updated: Partial<Terminal>) : Promise<Terminal>{
        const terminal = await this.terminalRepository.findOneBy({id: terminal_updated.id})
        if(!terminal) throw new NotFoundException('Terminal not found!')
        this.terminalRepository.merge(terminal, terminal_updated)
        return await this.terminalRepository.save(terminal);
    }

    async upsert(terminal_updated: Partial<Terminal>, card_updated?: Partial<Card>) : Promise<Terminal>{
        const terminal = await this.terminalRepository.findOne({
            where: {uid_terminal: terminal_updated.uid_terminal},
            relations: ['active_card']
        });
        if(!terminal) return await this.add(terminal_updated)
        if(terminal.active_card && card_updated){
            if(!card_updated.end_date_card)
                return terminal
            else if(terminal.active_card.end_date_card.getTime() > new Date(card_updated.end_date_card).getTime())
                return terminal;
        }
        this.terminalRepository.merge(terminal, terminal_updated)
        return await this.terminalRepository.save(terminal);
    }

    async remove(terminal_id: number) : Promise<DeleteResult>{
        const result = await this.terminalRepository.delete({id: terminal_id})
        if(result.affected === 0) throw new NotFoundException('Terminal not found')
        return result;
    }


}
