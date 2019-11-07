import pandas as pd
import numpy as np
import hdbscan
import matplotlib.pyplot as plt

from scipy.stats import zscore

data_df = pd.read_csv('county.csv')
print (data_df.shape)
data = data_df.drop(['state', 'county'], axis=1)
# data = data_df.drop(['fips'], axis=1)
print (data.shape)

# z-score the columns
df_normal = (data - data.mean()) / data.std(ddof=0)
# df_normal = data.apply(zscore)

# clusterer = hdbscan.HDBSCAN(algorithm='best', alpha=1.0, approx_min_span_tree=True,
#     gen_min_span_tree=False, leaf_size=40, metric='braycurtis', min_cluster_size=12, min_samples=None, p=None)

clusterer = hdbscan.HDBSCAN(algorithm='best', alpha=1.0, approx_min_span_tree=True,
    gen_min_span_tree=False, leaf_size=40, metric='braycurtis', min_cluster_size=21, min_samples=None, p=None)

clusterer.fit(df_normal)

_, num_bins = np.unique(clusterer.labels_, return_counts=True)
num_bins = len(num_bins)
n, bins, patches = plt.hist(clusterer.labels_, num_bins, facecolor='blue', alpha=0.5)
plt.show()

data_df['cluster'] = clusterer.labels_
data_df.to_csv('county_clustered.csv', index=False)