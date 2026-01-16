
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { User, Job, ServiceRequest, Team, AutoService, HeavyMachinery, HitchhikingCargo, Conversation, MarketItem } from './types';

class MuzhikDatabase {
  private async safeQuery<T>(query: PromiseLike<{ data: T | null; error: any }>, fallback: T): Promise<T> {
    if (!isSupabaseConfigured()) return fallback;
    try {
      const { data, error } = await query;
      if (error) {
        console.error("MuzhikDB Query Error:", error.message);
        return fallback;
      }
      return data ?? fallback;
    } catch (e) {
      console.error("MuzhikDB Network Error:", e);
      return fallback;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) return { success: false, message: 'Ключи Supabase не найдены' };
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) return { success: false, message: `Ошибка Supabase: ${error.message}` };
      return { success: true, message: 'Соединение установлено успешно' };
    } catch (e: any) {
      return { success: false, message: `Сетевая ошибка: ${e?.message || 'Failed to fetch'}` };
    }
  }

  async getCurrentSessionUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      return this.getUser(session.user.id);
    } catch (e) { return null; }
  }

  async getAllUsers(): Promise<User[]> {
    const data = await this.safeQuery(supabase.from('profiles').select('*').order('created_at', { ascending: false }), []);
    return data.map(v => this.mapProfileToUser(v));
  }

  async getUser(uuid: string): Promise<User | null> {
    if (!isSupabaseConfigured() || !uuid) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uuid).single();
    if (error || !data) return null;
    return this.mapProfileToUser(data);
  }

  async getUserByReferralCode(code: string): Promise<User | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('referral_code', code).single();
    if (error || !data) return null;
    return this.mapProfileToUser(data);
  }

  async getReferralsCount(userId: string): Promise<number> {
    const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('referred_by_id', userId);
    return count || 0;
  }

  private mapProfileToUser(data: any): User {
    return {
      id: data.id,
      username: data.username || '',
      firstName: data.first_name || 'Мужик',
      photoUrl: data.photo_url,
      rating: data.rating,
      points: data.points,
      isPro: data.is_pro,
      isAdmin: data.is_admin ?? false,
      isVerified: data.is_verified,
      isReliable: data.is_reliable ?? true,
      isBanned: data.is_banned ?? false,
      referralCode: data.referral_code ?? `M${data.id.substring(0, 8)}`,
      referredById: data.referred_by_id,
      dealsCount: data.deals_count,
      isDonor: data.is_donor ?? false,
      level: data.level ?? 'Мужик',
      specialization: data.specialization || []
    };
  }

  async saveUser(user: User, telegram_id?: number): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const payload: any = {
      id: user.id,
      username: user.username,
      first_name: user.firstName,
      photo_url: user.photoUrl,
      rating: user.rating,
      points: user.points,
      is_pro: user.isPro,
      is_admin: user.isAdmin,
      is_verified: user.isVerified,
      deals_count: user.dealsCount,
      specialization: user.specialization,
      is_reliable: user.isReliable,
      referral_code: user.referralCode,
      referred_by_id: user.referredById,
      is_donor: user.isDonor,
      level: user.level,
      is_banned: user.isBanned
    };
    if (telegram_id) payload.telegram_id = telegram_id;
    await supabase.from('profiles').upsert(payload);
  }

  async getJobs(): Promise<Job[]> {
    const data = await this.safeQuery(supabase.from('vacancies').select('*').eq('is_active', true).order('created_at', { ascending: false }), []);
    return data.map(v => ({ id: v.id.toString(), authorId: v.author_id, title: v.title, salary: v.salary, region: v.region, cityId: v.city_id, isVahta: v.is_vahta, housing: v.housing, description: v.description, contact: v.contact }));
  }

  async addJob(job: Job): Promise<void> {
    await supabase.from('vacancies').insert([{ author_id: job.authorId, title: job.title, salary: job.salary, region: job.region, city_id: job.cityId, is_vahta: job.isVahta, housing: job.housing, description: job.description, contact: job.contact, is_active: true }]);
  }

  async getMarketItems(): Promise<MarketItem[]> {
    const data = await this.safeQuery(supabase.from('market_items').select('*').order('created_at', { ascending: false }), []);
    return data.map(m => ({ id: m.id.toString(), authorId: m.author_id, type: m.type, category: m.category, title: m.title, price: m.price, condition: m.condition, description: m.description, contact: m.contact, cityId: m.city_id }));
  }

  async addMarketItem(item: MarketItem): Promise<void> {
    await supabase.from('market_items').insert([{ author_id: item.authorId, type: item.type, category: item.category, title: item.title, price: item.price, condition: item.condition, description: item.description, contact: item.contact, city_id: item.cityId }]);
  }

  async deleteMarketItem(id: string): Promise<void> { await supabase.from('market_items').delete().eq('id', id); }
  async getServices(): Promise<ServiceRequest[]> {
    const data = await this.safeQuery(supabase.from('services').select('*').order('created_at', { ascending: false }), []);
    return data.map(s => ({ id: s.id.toString(), authorId: s.author_id, category: s.category, title: s.title, description: s.description, price: s.price, author: s.author, contact: s.contact, city_id: s.city_id }));
  }
  async addService(s: ServiceRequest): Promise<void> {
    await supabase.from('services').insert([{ author_id: s.authorId, category: s.category, title: s.title, description: s.description, price: s.price, author: s.author, contact: s.contact, city_id: s.cityId }]);
  }
  async getCargo(): Promise<HitchhikingCargo[]> {
    const data = await this.safeQuery(supabase.from('cargo').select('*').order('created_at', { ascending: false }), []);
    return data.map(c => ({ id: c.id.toString(), authorId: c.author_id, title: c.title, routeFrom: c.route_from, routeTo: c.route_to, cargoType: c.cargo_type, weight: c.weight, price: c.price, departureDate: c.departure_date, description: c.description, contact: c.contact }));
  }
  async addCargo(c: HitchhikingCargo): Promise<void> {
    await supabase.from('cargo').insert([{ author_id: c.authorId, title: c.title, route_from: c.routeFrom, route_to: c.routeTo, cargo_type: c.cargoType, weight: c.weight, price: c.price, departure_date: c.departureDate, description: c.description, contact: c.contact }]);
  }
  async getTeams(): Promise<Team[]> {
    const data = await this.safeQuery(supabase.from('teams').select('*').order('created_at', { ascending: false }), []);
    return data.map(t => ({ id: t.id.toString(), authorId: t.author_id, name: t.name, leader: t.leader, category: t.category, memberCount: t.member_count, structure: t.structure, equipment: t.equipment, description: t.description, rating: t.rating, cityId: t.city_id, contact: t.contact }));
  }
  async addTeam(t: Team): Promise<void> {
    await supabase.from('teams').insert([{ author_id: t.authorId, name: t.name, leader: t.leader, category: t.category, member_count: t.memberCount, structure: t.structure, equipment: t.equipment, description: t.description, rating: t.rating, city_id: t.cityId, contact: t.contact }]);
  }
  async getAutoServices(): Promise<AutoService[]> {
    const data = await this.safeQuery(supabase.from('auto_services').select('*').order('created_at', { ascending: false }), []);
    return data.map(as => ({ id: as.id.toString(), authorId: as.author_id, name: as.name, category: as.category, address: as.address, description: as.description, rating: as.rating, cityId: as.city_id, contact: as.contact, features: as.features }));
  }
  async addAutoService(as: AutoService): Promise<void> {
    await supabase.from('auto_services').insert([{ author_id: as.authorId, name: as.name, category: as.category, address: as.address, description: as.description, rating: as.rating, city_id: as.cityId, contact: as.contact, features: as.features }]);
  }
  async getMachinery(): Promise<HeavyMachinery[]> {
    const data = await this.safeQuery(supabase.from('machinery').select('*').order('created_at', { ascending: false }), []);
    return data.map(m => ({ id: m.id.toString(), authorId: m.author_id, type: m.type, model: m.model, rate: m.rate, cityId: m.city_id, description: m.description, contact: m.contact, includesOperator: m.includes_operator, includesFuel: m.includes_fuel, specs: m.specs }));
  }
  async addMachinery(m: HeavyMachinery): Promise<void> {
    await supabase.from('machinery').insert([{ author_id: m.authorId, type: m.type, model: m.model, rate: m.rate, city_id: m.cityId, description: m.description, contact: m.contact, includes_operator: m.includesOperator, includes_fuel: m.includesFuel, specs: m.specs }]);
  }
  async deleteJob(id: string): Promise<void> { await supabase.from('vacancies').delete().eq('id', id); }
  async deleteService(id: string): Promise<void> { await supabase.from('services').delete().eq('id', id); }
  async deleteCargo(id: string): Promise<void> { await supabase.from('cargo').delete().eq('id', id); }
  async deleteTeam(id: string): Promise<void> { await supabase.from('teams').delete().eq('id', id); }
  async deleteAutoService(id: string): Promise<void> { await supabase.from('auto_services').delete().eq('id', id); }
  async deleteMachinery(id: string): Promise<void> { await supabase.from('machinery').delete().eq('id', id); }
  async updateUserPoints(userId: string, points: number): Promise<void> { await supabase.from('profiles').update({ points }).eq('id', userId); }
  async toggleUserBan(userId: string, is_banned: boolean): Promise<void> { await supabase.from('profiles').update({ is_banned }).eq('id', userId); }
  async getDonations(): Promise<any[]> { return []; }
  async addDonation(u: string, p: any): Promise<void> {}
  async getConversations(u: string): Promise<Conversation[]> { return []; }
  async getUserAds(u: string): Promise<any[]> { return []; }
}

export const db = new MuzhikDatabase();
