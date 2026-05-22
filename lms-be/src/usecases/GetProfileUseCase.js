export class GetProfileUseCase {
constructor(userRepository) {
    this.userRepository = userRepository;
    }

async execute(nomorInduk) {
    const user = await this.userRepository.getDetailProfile(nomorInduk);
    if (!user) throw new Error('Profil tidak ditemukan');
    
    return user;
    }
}