// import { AnyNsRecord } from 'dns';
import { PipelineStage, Model, HydratedDocument } from 'mongoose';
import * as JSONStream from "jsonstream";

export class DBUtilsService<T> {
    constructor(private readonly model: Model<T>) {}

    async save(data: any): Promise<T> {
        const newDoc = new this.model(data);
        newDoc.save()
        return newDoc;
    }

    async create(data: any): Promise<T> {
        const doc = await this.model.create(data);
        return doc;
    }

    async find(filter: object= {}, projection: object= {}, populate: any=[] as any[]|{}, sort: any={}, skip=0, limit=0, setOption: object={}):Promise<T[]>{
        const doc = await this.model.find(filter, projection).populate(populate).sort(sort).skip(skip).limit(limit).setOptions(setOption).exec();
        return doc || null;
    }

    async findOne(filter:object={}, projection: object= {}, populate:any=[]as any[]|{}, sort: any={}, limit=0, lean:boolean=false):Promise<T|null|HydratedDocument<T>> {
        let query:any = this.model.findOne(filter, projection).populate(populate).sort(sort).limit(limit);
        if (lean && query){
            query = query.lean();
            return query.exec() as Promise<T>
        } 
        const doc = await query.exec();
        return doc as HydratedDocument<T>;
    }

    // async findOneWithSave(filter:object={}, projection: object= {}, populate:any[]=[], sort: any={}, limit=0) {
    //     const doc = await this.model.findOne(filter, projection).populate(populate).sort(sort).limit(limit);
    //     // if(!doc) return {};
    //     return doc || null;
    // }

    async findById(id:string|object, projection: object= {}, populate: any=[] as any[]|{} , setOption: object={}) {
        const doc = await this.model.findById(id, projection).populate(populate).setOptions(setOption).exec();
        return doc || null;
    }

    // async findByIdAndDelete(id:string):Promise<T>{
    //     const doc = await this.model.findByIdAndDelete(id).exec();
    //     return doc;
    // }

    // async findOneAndDelete(filter: object):Promise<T>{
    //     const doc = await this.model.findOneAndDelete(filter).exec();
    //     return doc;
    // }

    async bulkWrite(operations: any[], options: object = {}): Promise<any> {
        if (!Array.isArray(operations) || operations.length === 0) {
            throw new Error("bulkWrite requires a non-empty array of operations.");
        }
    
        try {
            const result = await this.model.bulkWrite(operations, options);
            return result;
        } catch (error:any) {
            throw new Error(`bulkWrite failed: ${error.message}`);
        }
    }
       
    async updateOne(find: object, data: object, options: object = {}):Promise<T|{}> {
        const doc = await this.model.updateOne(find, data, options).exec()
        return doc;
    }    

    async findOneAndUpdate(find: object, data: object, options: object = {}, populate: any=[] as any[]|{}) {
        const doc = await this.model.findOneAndUpdate(find, data, options).populate(populate).exec();
        return doc || null;
    }  

    async findByIdAndUpdate(find: string|object, data: object = {}, options: object = {}, populate: any=[] as any[]|{}) {
        const doc = await this.model.findByIdAndUpdate(find, data, options).populate(populate).exec();
        return doc || null;
    }    
    
    async countDocuments(filter: object={}, options: object={} ):Promise<number>{
        const res = await this.model.countDocuments(filter, options).exec()
        return res;
    }

    async insertMany(docs: T[]) {
        const createdDocs = await this.model.insertMany(docs);
        return createdDocs;
    }

    async deleteOne(filter: object): Promise<object>{
        const deleteDocs = await this.model.deleteOne(filter)
        return deleteDocs;
    }

    async deleteMany(filter: object): Promise<object>{
        const deleteDocs = await this.model.deleteMany(filter)
        return deleteDocs;
    }

    async updateMany(filter:object, data: object, options: object = {}): Promise<any>{
        const updatedDocs = await this.model.updateMany(filter, data, options)
        return updatedDocs;
    }

    async export(query: object, populate: any=[] as any[]|{}, sort: any={}, jstream: any, res: any): Promise<void> {
        return await this.model.find(query).sort(sort).populate(populate).cursor().pipe(JSONStream.stringify()).pipe(jstream).pipe(res);
    }

    async exportAggragate(aggragate: any=[], jstream: any, res: any): Promise<void> {
        return await this.model.aggregate(aggragate).cursor().pipe(JSONStream.stringify()).pipe(jstream).pipe(res);
    }

   async aggregate(filter: PipelineStage[]):Promise<T[]> {
        const result = this.model.aggregate(filter)
        return result;
   } 

    async exportWithFind(query:object, projection:object={}, options:object={}, populate: any[]=[], jstream:any,res:any) {
        const result = await this.model.find(query, projection, options).populate(populate).cursor().pipe(JSONStream.stringify()).pipe(jstream).pipe(res);
        return result;
   }

}