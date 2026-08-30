import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FeedService } from '@shared/services/feed.service';
import { SettingsService } from '@shared/services/settings.service';
import { FeedCategory } from '@shared/models/models';

const CATEGORY_LABEL: Record<FeedCategory, string> = {
  all: 'All',
  security: 'Security',
  ai: 'AI & Robotics',
  custom: 'Custom',
};

@Component({
  selector: 'app-feed-panel',
  imports: [],
  templateUrl: './feed-panel.html',
  styleUrl: './feed-panel.scss',
})
export class FeedPanel implements OnInit {
  private readonly feedService = inject(FeedService);
  private readonly settings = inject(SettingsService);

  protected readonly feeds = this.feedService.feeds;
  protected readonly loading = this.feedService.loading;
  protected readonly failedSources = this.feedService.failedSources;
  protected readonly activeTab = signal<FeedCategory>('all');

  protected readonly availableTabs = computed<FeedCategory[]>(() => {
    const categories = new Set(this.feeds().map((feed) => feed.category));
    return categories.size > 1 ? (['all', ...categories] as FeedCategory[]) : [...categories];
  });

  protected readonly visibleFeeds = computed(() => {
    const tab = this.activeTab();
    return tab === 'all' ? this.feeds() : this.feeds().filter((feed) => feed.category === tab);
  });

  ngOnInit(): void {
    const { feedToDisplay, feed } = this.settings.settings();
    this.feedService.load({ feedToDisplay, feed });
  }

  protected label(category: FeedCategory): string {
    return CATEGORY_LABEL[category];
  }
}
