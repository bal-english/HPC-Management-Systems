
export class Obfuscation{
#obfuscateString:string

 constructor(pass:string){
    this.#obfuscateString = pass;
 }
 print(){
     console.log("Hidden Password")
 }


 getPass(){
    return this.#obfuscateString;
 }
}