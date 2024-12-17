use anchor_lang::prelude::*;

#[account]
pub struct RootState {
    pub total_amount: u64,
}
impl RootState {
    pub const MAX_SIZE: usize = 8;
}
