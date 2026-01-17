
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { User, Job, ServiceRequest, Team, AutoService, HeavyMachinery, HitchhikingCargo, Conversation, MarketItem, VakhtaEntry, Note, FeedPost, SOSSignal } from './types';

class MuzhikDatabase {
  private isValidUuid(id: string) {
    if (!id || id === 'guest') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  }

  private async safeQuery<T>(query: PromiseLike<{ data: T | null; error: any }>, fallback: T): Promise<T> {
    if (!isSupabaseConfigured()) return fallback;
    try {
      const { data, error } = await query;
      if (error) {
        console.error("Supabase Error:", error);
        return fallback;
      }
      return data ?? fallback;
    } catch (e) { 
      console.error("Query Exception:", e);
      return fallback; 
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) return { success: false, message: 'No config' };
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return error ? { success: false, message: error.message } : { success: true, message: 'OK' };
  }

  async getCurrentSessionUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    return await this.getUser(session.user.id);
  }

  async getUser(uuid: string): Promise<User | null> {
    if (!this.isValidUuid(uuid)) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uuid).single();
    if (error || !data) return null;
    return this.mapProfileToUser(data);
  }

  // Add saveUser method to handle profile creation/updates
  async saveUser(user: User): Promise<void> {
    if (!this.isValidUuid(user.id)) return;
    await supabase.from('profiles').upsert([{
      id: user.id,
      username: user.username,
      first_name: user.firstName,
      photo_url: user.photoUrl,
      rating: user.rating,
      points: user.points,
      is_pro: user.isPro,
      is_admin: user.isAdmin,
      is_verified: user.isVerified,
      is_reliable: user.isReliable,
      is_banned: user.isBanned,
      referral_code: user.referralCode,
      referred_by_id: user.referredById,
      deals_count: user.dealsCount,
      is_donor: user.isDonor,
      level: user.level,
      specialization: user.specialization,
      portfolio_images: user.portfolioImages,
      trusted_contacts: user.trustedContacts
    }]);
  }

  async getAllUsers(): Promise<User[]> {
    const data = await this.safeQuery(supabase.from('profiles').select('*').order('points', { ascending: false }), []);
    return data.map(p => this.mapProfileToUser(p));
  }

  private mapProfileToUser(data: any): User {
    return {
      id: data.id,
      username: data.username || '',
      firstName: data.first_name || 'Мужик',
      photoUrl: data.photo_url,
      rating: Number(data.rating) || 5.0,
      points: data.points || 0,
      isPro: data.is_pro || false,
      isAdmin: data.is_admin || false,
      isVerified: data.is_verified || false,
      isReliable: data.is_reliable ?? true,
      isBanned: data.is_banned || false,
      referralCode: data.referral_code || `M${data.id.substring(0, 8)}`,
      referredById: data.referred_by_id,
      dealsCount: data.deals_count || 0,
      isDonor: data.is_donor || false,
      level: data.level || 'Мужик',
      specialization: data.specialization || [],
      portfolioImages: data.portfolio_images || [],
      trustedContacts: data.trusted_contacts || []
    };
  }

  async getNotes(userId: string): Promise<Note[]> { 
    if (!this.isValidUuid(userId)) return [];
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return (data || []).map(n => ({ 
      id: n.id, 
      text: n.text, 
      timestamp: new Date(n.created_at).getTime() 
    })); 
  }
  
  async addNote(userId: string, text: string): Promise<Note | null> { 
    if (!this.isValidUuid(userId)) return null;
    const { data, error } = await supabase
      .from('notes')
      .insert([{ user_id: userId, text }])
      .select()
      .single();
    
    if (error) return null;
    return {
      id: data.id,
      text: data.text,
      timestamp: new Date(data.created_at).getTime()
    };
  }
  
  async deleteNote(id: string): Promise<void> { 
    await supabase.from('notes').delete().eq('id', id); 
  }

  // ... Остальные методы (getJobs, Feed и т.д.)
  async getJobs(): Promise<Job[]> { const data = await this.safeQuery(supabase.from('vacancies').select('*').eq('is_active', true).order('created_at', { ascending: false }), []); return data.map(v => ({ id: v.id.toString(), authorId: v.author_id, title: v.title, salary: v.salary, region: v.region, cityId: v.city_id, isVahta: v.is_vahta, housing: v.housing, description: v.description, contact: v.contact })); }
  async addJob(job: Job): Promise<void> { await supabase.from('vacancies').insert([{ author_id: job.authorId, title: job.title, salary: job.salary, region: job.region, city_id: job.cityId, is_vahta: job.isVahta, housing: job.housing, description: job.description, contact: job.contact, is_active: true }]); }
  async getFeedPosts(): Promise<FeedPost[]> { const { data } = await supabase.from('feed_posts').select('*, profiles(first_name, photo_url)').order('created_at', { ascending: false }); return (data || []).map(p => ({ id: p.id, authorId: p.author_id, authorName: p.profiles?.first_name || 'Мужик', authorPhoto: p.profiles?.photo_url, content: p.content, imageUrl: p.image_url, createdAt: new Date(p.created_at).getTime(), isSos: p.content.includes('[SOS]') })); }
  async addFeedPost(userId: string, content: string, imageUrl?: string): Promise<void> { if (!this.isValidUuid(userId)) return; await supabase.from('feed_posts').insert([{ author_id: userId, content, image_url: imageUrl }]); }
  async deleteFeedPost(postId: string): Promise<void> { await supabase.from('feed_posts').delete().eq('id', postId); }
  async getMarketItems(): Promise<MarketItem[]> { const data = await this.safeQuery(supabase.from('market_items').select('*').order('created_at', { ascending: false }), []); return data.map(m => ({ id: m.id.toString(), authorId: m.author_id, type: m.type, category: m.category, title: m.title, price: m.price, condition: m.condition, description: m.description, contact: m.contact, cityId: m.city_id })); }
  async addMarketItem(item: MarketItem): Promise<void> { await supabase.from('market_items').insert([{ author_id: item.authorId, type: item.type, category: item.category, title: item.title, price: item.price, condition: item.condition, description: item.description, contact: item.contact, city_id: item.cityId }]); }
  async deleteMarketItem(id: string): Promise<void> { await supabase.from('market_items').delete().eq('id', id); }
  async getLatestVakhtaEntry(userId: string): Promise<VakhtaEntry | null> { if (!this.isValidUuid(userId)) return null; const data = await this.safeQuery(supabase.from('vakhta_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(), null); if (!data) return null; return { startDate: data.start_date, endDate: data.end_date || data.start_date, expectedSalary: data.expected_salary, advances: data.advances, travelExpenses: data.travel_expenses, foodExpenses: data.food_expenses, sentHome: data.sent_home }; }
  async saveVakhtaEntry(userId: string, entry: VakhtaEntry): Promise<void> { if (!this.isValidUuid(userId)) return; await supabase.from('vakhta_entries').insert([{ user_id: userId, start_date: entry.startDate, end_date: entry.endDate, expected_salary: entry.expectedSalary, advances: entry.advances, travel_expenses: entry.travelExpenses, food_expenses: entry.foodExpenses, sent_home: entry.sentHome }]); }
  async sendSOS(userId: string, userName: string, signal: Omit<SOSSignal, 'id' | 'userId' | 'userName' | 'status'>): Promise<void> { if (!this.isValidUuid(userId)) return; await supabase.from('sos_signals').insert([{ user_id: userId, user_name: userName, scenario: signal.scenario, lat: signal.lat, lng: signal.lng, status: 'SENT' }]); await this.addFeedPost(userId, `[SOS] СРОЧНО! Помощь: ${signal.scenario}. Координаты: ${signal.lat}, ${signal.lng}`); }
  async requestVerification(userId: string, fullName: string, specialization: string): Promise<void> { if (!this.isValidUuid(userId)) return; await supabase.from('verification_requests').insert([{ user_id: userId, full_name: fullName, specialization }]); }
  async addPortfolioImage(userId: string, imageUrl: string): Promise<void> { if (!this.isValidUuid(userId)) return; const { data: user } = await supabase.from('profiles').select('portfolio_images').eq('id', userId).single(); const currentImages = user?.portfolio_images || []; await supabase.from('profiles').update({ portfolio_images: [...currentImages, imageUrl] }).eq('id', userId); }
  async updateUserPoints(userId: string, points: number): Promise<void> { if (!this.isValidUuid(userId)) return; await supabase.from('profiles').update({ points }).eq('id', userId); }
  async toggleUserBan(userId: string, is_banned: boolean): Promise<void> { if (!this.isValidUuid(userId)) return; await supabase.from('profiles').update({ is_banned }).eq('id', userId); }
  async getUserByReferralCode(code: string): Promise<User | null> { const { data, error } = await supabase.from('profiles').select('*').eq('referral_code', code).single(); if (error || !data) return null; return this.mapProfileToUser(data); }
  async getReferralsCount(userId: string): Promise<number> { if (!this.isValidUuid(userId)) return 0; const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by_id', userId); return count || 0; }
  async updateTrustedContacts(userId: string, contacts: string[]): Promise<void> { if (!this.isValidUuid(userId)) return; await supabase.from('profiles').update({ trusted_contacts: contacts }).eq('id', userId); }
  async getAutoServices(): Promise<AutoService[]> { const data = await this.safeQuery(supabase.from('auto_services').select('*').order('created_at', { ascending: false }), []); return data.map(as => ({ id: as.id.toString(), authorId: as.author_id, name: as.name, category: as.category, address: as.address, description: as.description, rating: as.rating, cityId: as.city_id, contact: as.contact, features: as.features })); }
  async addAutoService(as: AutoService): Promise<void> { await supabase.from('auto_services').insert([{ author_id: as.authorId, name: as.name, category: as.category, address: as.address, description: as.description, rating: as.rating, city_id: as.cityId, contact: as.contact, features: as.features }]); }
  async getMachinery(): Promise<HeavyMachinery[]> { const data = await this.safeQuery(supabase.from('machinery').select('*').order('created_at', { ascending: false }), []); return data.map(m => ({ id: m.id.toString(), authorId: m.author_id, type: m.type, model: m.model, rate: m.rate, cityId: m.city_id, description: m.description, contact: m.contact, includes_operator: m.includesOperator, includes_fuel: m.includesFuel, specs: m.specs })); }
  async addMachinery(m: HeavyMachinery): Promise<void> { await supabase.from('machinery').insert([{ author_id: m.authorId, type: m.type, model: m.model, rate: m.rate, city_id: m.cityId, description: m.description, contact: m.contact, includes_operator: m.includesOperator, includes_fuel: m.includesFuel, specs: m.specs }]); }
  async getTeams(): Promise<Team[]> { const data = await this.safeQuery(supabase.from('teams').select('*').order('created_at', { ascending: false }), []); return data.map(t => ({ id: t.id.toString(), authorId: t.author_id, name: t.name, leader: t.leader, category: t.category, memberCount: t.member_count, structure: t.structure, equipment: t.equipment, description: t.description, rating: t.rating, city_id: t.city_id, contact: t.contact })); }
  async addTeam(team: Team): Promise<void> { await supabase.from('teams').insert([{ author_id: team.authorId, name: team.name, leader: team.leader, category: team.category, member_count: team.memberCount, structure: team.structure, equipment: team.equipment, description: team.description, rating: team.rating, city_id: team.cityId, contact: team.contact }]); }
  async getCargo(): Promise<HitchhikingCargo[]> { const data = await this.safeQuery(supabase.from('cargo').select('*').order('created_at', { ascending: false }), []); return data.map(c => ({ id: c.id.toString(), authorId: c.author_id, title: c.title, route_from: c.routeFrom, route_to: c.routeTo, cargo_type: c.cargo_type, weight: c.weight, price: c.price, departure_date: c.departureDate, description: c.description, contact: c.contact })); }
  async addCargo(cargo: HitchhikingCargo): Promise<void> { await supabase.from('cargo').insert([{ author_id: cargo.authorId, title: cargo.title, route_from: cargo.routeFrom, route_to: cargo.routeTo, cargo_type: cargo.cargoType, weight: cargo.weight, price: cargo.price, departure_date: cargo.departureDate, description: cargo.description, contact: cargo.contact }]); }
  async deleteJob(id: string): Promise<void> { await supabase.from('vacancies').delete().eq('id', id); }
  async deleteService(id: string): Promise<void> { await supabase.from('services').delete().eq('id', id); }
  async deleteCargo(id: string): Promise<void> { await supabase.from('cargo').delete().eq('id', id); }
  async deleteTeam(id: string): Promise<void> { await supabase.from('teams').delete().eq('id', id); }
  async deleteAutoService(id: string): Promise<void> { await supabase.from('auto_services').delete().eq('id', id); }
  async deleteMachinery(id: string): Promise<void> { await supabase.from('machinery').delete().eq('id', id); }
  async getServices(): Promise<ServiceRequest[]> { const data = await this.safeQuery(supabase.from('services').select('*').order('created_at', { ascending: false }), []); return data.map(s => ({ id: s.id.toString(), authorId: s.author_id, category: s.category, title: s.title, description: s.description, price: s.price, author: s.author, contact: s.contact, city_id: s.city_id })); }
  async addService(service: ServiceRequest): Promise<void> { await supabase.from('services').insert([{ author_id: service.authorId, category: service.category, title: service.title, description: service.description, price: service.price, author: service.author, contact: service.contact, city_id: service.cityId }]); }
  async getConversations(u: string): Promise<Conversation[]> { return []; }
  async getUserAds(u: string): Promise<any[]> { return []; }
  async getDonations(): Promise<any[]> { return []; }
  async addDonation(u: string, p: any): Promise<void> {}
}

export const db = new MuzhikDatabase();
