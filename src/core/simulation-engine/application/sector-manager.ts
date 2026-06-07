/**
 * EMPIRION CORE - MULTI-SECTOR INTERSTICES STRATEGY REGISTRY
 * Versão: v1.0.0 Future Ready (Clean Architecture & DDD Registry)
 * Data: 07 de Junho de 2026
 * 
 * Este gerenciador centraliza o registro e a obtenção das engines de regras e simuladores específicos
 * de cada setor do simulador, aplicando o padrão Open-Closed Principle (SOLID) e Strategy Pattern.
 */

import { ISectorRulesEngine, SimulationSector } from '../../../../types/sector';

export class SectorEngineRegistry {
  private static instance: SectorEngineRegistry;
  private engines: Map<SimulationSector, ISectorRulesEngine> = new Map();

  private constructor() {
    // Construtor privado para garantir padrão Singleton
  }

  public static getInstance(): SectorEngineRegistry {
    if (!SectorEngineRegistry.instance) {
      SectorEngineRegistry.instance = new SectorEngineRegistry();
    }
    return SectorEngineRegistry.instance;
  }

  /**
   * Registra uma nova engine de regras de setor no Core do simulador.
   */
  public registerEngine(sector: SimulationSector, engine: ISectorRulesEngine): void {
    console.log(`[SectorEngineRegistry] Registrando motor de simulação para o setor: ${sector.toUpperCase()}`);
    this.engines.set(sector, engine);
  }

  /**
   * Recupera a engine de cálculo e regras do setor correspondente.
   * Se nenhuma engine personalizada estiver registrada para o setor,
   * opcionalmente retorna uma implementação mock/stub para assegurar o funcionamento resiliente do app (Graceful Fallback).
   */
  public getEngine(sector: SimulationSector): ISectorRulesEngine {
    const engine = this.engines.get(sector);
    if (!engine) {
      throw new Error(
        `[SectorEngineRegistry] Erro Crítico: Nenhuma engine contábil-operacional foi registrada para o setor "${sector}". ` +
        `Por favor, certifique-se de carregar e registrar o respectivo Bounded Context no bootstrap da aplicação.`
      );
    }
    return engine;
  }

  /**
   * Verifica se o suporte para determinado setor econômico está ativado e configurado de fábrica.
   */
  public hasEngine(sector: SimulationSector): boolean {
    return this.engines.has(sector);
  }

  /**
   * Retorna a lista de todos os setores econômicos atualmente suportados e devidamente acoplados à Arena.
   */
  public getRegisteredSectors(): SimulationSector[] {
    return Array.from(this.engines.keys());
  }

  /**
   * Desregistra todas as engines (útil para cenários de testes unitários herméticos).
   */
  public clear(): void {
    this.engines.clear();
  }
}
