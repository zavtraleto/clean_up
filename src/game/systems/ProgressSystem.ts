import { CoverageMap } from "../core/CoverageMap";

export class ProgressSystem {
  constructor(private cov: CoverageMap) {}

  getProgress() {
    return this.cov.progress();
  }
}
