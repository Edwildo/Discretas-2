export class User {
    constructor(name, document, password) {
      this.name = name;
      this.document = document;
      this.password = password;
    }
  
    getNombre() {
      return this.name;
    }

    setNombre(name) {
      this.name = name;
    }
  
    getDocumento() {
      return this.document;
    }
  
    setDocumento(document) {
      this.document = document;
    }
  
    imprimirInformacion() {
      console.log(`Nombre: ${this.name}, Documento: ${this.document}`);
    }
  }
  