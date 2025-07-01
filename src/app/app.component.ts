import { Component, ElementRef, AfterViewInit, viewChild, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true, 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class AppComponent implements AfterViewInit { 
  isDarkMode: boolean = false;

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  mudar(): void {
    this.isDarkMode = !this.isDarkMode; 
    if (this.isDarkMode) {
      this.renderer.addClass(this.document.body, 'dark-mode'); 
      this.renderer.removeClass(this.document.body, 'light-mode'); 
    } else {
      this.renderer.addClass(this.document.body, 'light-mode'); 
      this.renderer.removeClass(this.document.body, 'dark-mode'); 
    }
  }
  formatarInput(input: HTMLInputElement): void {
    let valor = input.value.replace(',', '.');
    let numero = parseFloat(valor);

    if (!isNaN(numero)) {
      input.value = numero.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }

  readonly txtLu = viewChild.required<ElementRef<HTMLInputElement>>('lu');
  readonly txtPro = viewChild.required<ElementRef<HTMLInputElement>>('pro');
  readonly spnErro = viewChild.required<ElementRef<HTMLSpanElement>>('spnErro');
  readonly ulHistorico = viewChild.required<ElementRef<HTMLUListElement>>('historico');

  ngAfterViewInit(): void {
    this.txtLu().nativeElement.focus(); 
    this.atualizarHistorico(); 
    this.isDarkMode = false; 
    this.renderer.addClass(this.document.body, 'light-mode');
    this.renderer.removeClass(this.document.body, 'dark-mode'); 
  }

  calcular(e: Event): void {
    e.preventDefault(); 

    const lucroInput = this.txtLu().nativeElement.value.trim();
    const produtoInput = this.txtPro().nativeElement.value.trim();

    if (!lucroInput && !produtoInput) {
      this.exibirErro("Por favor, preencha os campos acima.");
      return;
    }
    if (!lucroInput) {
      this.exibirErro("Por favor, informe a porcentagem de lucro desejada.");
      return;
    }
    else if (!produtoInput) {
      this.exibirErro("Por favor, informe o preço que pagou no produto.");
      return;
    }

    const lucro = parseFloat(lucroInput.replace(',', '.'));
    const produto = parseFloat(produtoInput.replace(',', '.'));

    if (isNaN(lucro)) {
      this.exibirErro("Por favor, insira um valor numérico válido para o lucro.");
      return;
    }
    if (isNaN(produto)) {
      this.exibirErro("Por favor, insira um valor numérico válido para o preço do produto.");
      return;
    }

    else if (lucro >= 100) {
      this.exibirErro("A porcentagem de lucro deve ser menor que 100% para que a venda seja possível.");
      return;
    }

    const decimal = (100 - lucro) / 100;
    const precoRevenda = produto / decimal;
    const valorFormatado = precoRevenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const mensagemResultado = "O valor para Revenda do produto é de " + valorFormatado;
    this.exibirErro(mensagemResultado, "success");
  }

  exibirErro(mensagem: string, tipo: string = "erro"): void {
    const spn = this.spnErro().nativeElement;
    spn.innerText = mensagem;
    spn.style.display = "block"; 
    spn.classList.remove("erro", "sucesso"); 

    if (tipo === "success") {
      spn.classList.add("sucesso"); 
      this.salvarNoHistorico(mensagem); 
      this.atualizarHistorico(); 
      setTimeout(() => spn.style.display = "none", 8000); 
    } else {
      spn.classList.add("erro"); 
      setTimeout(() => spn.style.display = "none", 4000); 
    }
  }

  
  salvarNoHistorico(mensagem: string): void {
    let historico = JSON.parse(localStorage.getItem("historico") || '[]');
    historico.unshift(mensagem);
    historico.splice(4);
    localStorage.setItem("historico", JSON.stringify(historico));
  }

  atualizarHistorico(): void {
    const ul = this.ulHistorico().nativeElement;
    ul.innerHTML = ""; 
    const historico = JSON.parse(localStorage.getItem("historico") || '[]');
    historico.forEach((item: string) => {
      const li = document.createElement("li"); 
      li.textContent = item;
      ul.appendChild(li);
    });
  }
}