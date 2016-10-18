import { ImageOverlapModule} from './image-overlap.module';
import * as models from './lib/models';
import { OverlapperComponent } from './overlapper/overlapper.component';

export * from './overlapper/overlapper.component';
export * from './image-overlap.module';
export * from './lib/models';

export default {
  ImageOverlapModule,
  OverlapperComponent,
  models
};
