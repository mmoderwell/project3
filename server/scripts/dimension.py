import pandas as pd
import numpy as np
import umap

import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import zscore

original_data = pd.read_csv('county_clustered.csv')
# get the clusters
clusters = original_data[['cluster']]

data = original_data.drop(['state', 'county', 'cluster'], axis=1)
# data = data.drop(['fips', 'cluster'], axis=1)
print (data.shape)

# z-score the columns
# df_normal = data.apply(zscore)
df_normal = (data - data.mean()) / data.std(ddof=0)

# embedding = umap.UMAP(n_neighbors=40, min_dist=0.8, metric='braycurtis', random_state=42).fit_transform(df_normal)
embedding = umap.UMAP(n_neighbors=10, min_dist=0.9, metric='braycurtis', random_state=42).fit_transform(df_normal)

# n_neighbors: This determines the number of neighboring points used in local approximations of manifold structure. Larger values will result in more global structure being preserved at the loss of detailed local structure. In general this parameter should often be in the range 5 to 50, with a choice of 10 to 15 being a sensible default.
# min_dist: This controls how tightly the embedding is allowed compress points together. Larger values ensure embedded points are more evenly distributed, while smaller values allow the algorithm to optimise more accurately with regard to local structure. Sensible values are in the range 0.001 to 0.5, with 0.1 being a reasonable default.
# metric: This determines the choice of metric used to measure distance in the input space. A wide variety of metrics are already coded, and a user defined function can be passed as long as it has been JITd by numba.

# print (embedding)

# reducer = umap.UMAP(a=1.576943460405378, angular_rp_forest=False,
#    b=0.8950608781227859, init='spectral',
#    local_connectivity=1.0, metric='euclidean', metric_kwds={},
#    min_dist=0.1, n_components=2, n_epochs=None, n_neighbors=10,
#    negative_sample_rate=5, random_state=42, set_op_mix_ratio=1.0,
#    spread=1.0, target_metric='categorical', target_metric_kwds={},
#    transform_queue_size=4.0, transform_seed=42, verbose=False)

# reducer.fit(data)
# embedding = reducer.transform(data)

clusters = [(x + 1)[0] for x in clusters.values]
cluster_names = np.unique(clusters)
print (len(cluster_names), 'cluster labels')

fig, ax = plt.subplots(1, figsize=(14, 10))
plt.scatter(embedding[:, 0], embedding[:, 1], c=np.array(clusters), cmap='Spectral', alpha=1.0)
plt.setp(ax, xticks=[], yticks=[])
cbar = plt.colorbar(boundaries=np.arange(len(cluster_names) + 1)-0.5)
cbar.set_ticks(np.arange(len(cluster_names)))
cbar.set_ticklabels(cluster_names)

print (embedding)
out = pd.DataFrame(embedding)
out = out.join(pd.DataFrame(original_data))
out.to_csv('out.csv', index=False)
# plt.gca().set_aspect('equal', 'datalim')

plt.title('UMAP projection of County Demographic Data', fontsize=24);
plt.show()